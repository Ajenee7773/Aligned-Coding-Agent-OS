export class ProviderError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = 'ProviderError';
    this.details = details;
  }
}

function trimTrailingSlash(value) {
  return String(value ?? '').replace(/\/+$/, '');
}

function sleep(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason || new Error('Provider request was cancelled.'));
      return;
    }
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(signal.reason || new Error('Provider request was cancelled.'));
    }, { once: true });
  });
}

function retryableStatus(status) {
  return status === 408 || status === 409 || status === 429 || status >= 500;
}

function parseContent(data) {
  const choice = data?.choices?.[0];
  if (typeof choice?.message?.content === 'string') {
    return choice.message.content;
  }
  if (Array.isArray(choice?.message?.content)) {
    return choice.message.content
      .map((part) => (typeof part === 'string' ? part : part?.text ?? ''))
      .join('');
  }
  if (typeof data?.message?.content === 'string') {
    return data.message.content;
  }

  throw new ProviderError('Provider response did not include assistant content.', { data });
}

export class OpenAICompatibleProvider {
  constructor(config) {
    this.config = config;
  }

  async complete(messages, options = {}) {
    const provider = this.config.provider;
    const url = `${trimTrailingSlash(provider.baseUrl)}/chat/completions`;
    const maxAttempts = Math.max(1, Number(provider.maxAttempts || 3));

    const headers = {
      'content-type': 'application/json',
      ...(provider.headers ?? {})
    };

    if (provider.apiKey) {
      headers.authorization = `Bearer ${provider.apiKey}`;
    }

    const body = {
      model: provider.model,
      messages,
      stream: false,
      ...(provider.request ?? {}),
      ...(options.request ?? {})
    };

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      const controller = new AbortController();
      const timeout = setTimeout(
        () => controller.abort(new Error(`Provider request timed out after ${provider.timeoutMs ?? 120000} ms.`)),
        provider.timeoutMs ?? 120000,
      );
      const abort = () => controller.abort(options.signal?.reason || new Error('Provider request was cancelled.'));
      options.signal?.addEventListener('abort', abort, { once: true });

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify(body),
          signal: controller.signal
        });

        const text = await response.text();
        if (!response.ok) {
          const error = new ProviderError(`Provider returned HTTP ${response.status}.`, {
            status: response.status,
            body: text.slice(0, 2000),
            attempt,
          });
          if (attempt < maxAttempts && retryableStatus(response.status)) {
            await sleep(Math.min(4000, 500 * (2 ** (attempt - 1))), options.signal);
            continue;
          }
          throw error;
        }

        let data;
        try {
          data = JSON.parse(text);
        } catch (error) {
          throw new ProviderError(`Provider returned non-JSON response: ${error.message}`, {
            body: text.slice(0, 2000),
            attempt,
          });
        }

        return parseContent(data);
      } catch (error) {
        if (options.signal?.aborted) {
          throw new ProviderError('Provider request was cancelled.', { cancelled: true });
        }
        if (controller.signal.aborted && !(error instanceof ProviderError)) {
          throw new ProviderError(
            controller.signal.reason?.message ||
            `Provider request timed out after ${provider.timeoutMs ?? 120000} ms.`,
          );
        }
        if (error instanceof ProviderError) {
          throw error;
        }
        if (attempt < maxAttempts) {
          await sleep(Math.min(4000, 500 * (2 ** (attempt - 1))), options.signal);
          continue;
        }
        throw new ProviderError(`Provider request failed: ${error.message}`);
      } finally {
        clearTimeout(timeout);
        options.signal?.removeEventListener('abort', abort);
      }
    }

    throw new ProviderError('Provider request failed after all retry attempts.');
  }
}

async function nativeFetch(url, init, provider, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(new Error(`Provider request timed out after ${provider.timeoutMs ?? 120000} ms.`)),
    provider.timeoutMs ?? 120000,
  );
  const abort = () => controller.abort(options.signal?.reason || new Error('Provider request was cancelled.'));
  options.signal?.addEventListener('abort', abort, { once: true });
  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
    const text = await response.text();
    if (!response.ok) {
      throw new ProviderError(`Provider returned HTTP ${response.status}.`, {
        status: response.status,
        body: text.slice(0, 2000),
      });
    }
    try {
      return JSON.parse(text);
    } catch (error) {
      throw new ProviderError(`Provider returned non-JSON response: ${error.message}`, {
        body: text.slice(0, 2000),
      });
    }
  } catch (error) {
    if (options.signal?.aborted) {
      throw new ProviderError('Provider request was cancelled.', { cancelled: true });
    }
    if (error instanceof ProviderError) throw error;
    if (controller.signal.aborted) {
      throw new ProviderError(controller.signal.reason?.message || 'Provider request timed out.');
    }
    throw new ProviderError(`Provider request failed: ${error.message}`);
  } finally {
    clearTimeout(timeout);
    options.signal?.removeEventListener('abort', abort);
  }
}

export class AnthropicProvider {
  constructor(config) {
    this.config = config;
  }

  async complete(messages, options = {}) {
    const provider = this.config.provider;
    const system = messages
      .filter((message) => message.role === 'system')
      .map((message) => String(message.content || ''))
      .join('\n\n');
    const body = {
      model: provider.model,
      max_tokens: Number(provider.request?.max_tokens || 8192),
      temperature: Number(provider.request?.temperature ?? 0.1),
      system,
      messages: messages
        .filter((message) => message.role !== 'system')
        .map((message) => ({
          role: message.role === 'assistant' ? 'assistant' : 'user',
          content: String(message.content || ''),
        })),
    };
    const data = await nativeFetch(
      `${trimTrailingSlash(provider.baseUrl || 'https://api.anthropic.com/v1')}/messages`,
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': provider.apiKey,
          'anthropic-version': '2023-06-01',
          ...(provider.headers || {}),
        },
        body: JSON.stringify(body),
      },
      provider,
      options,
    );
    const text = (data.content || [])
      .filter((part) => part?.type === 'text')
      .map((part) => part.text || '')
      .join('');
    if (!text) throw new ProviderError('Anthropic response did not include text.', { data });
    return text;
  }
}

export class GoogleProvider {
  constructor(config) {
    this.config = config;
  }

  async complete(messages, options = {}) {
    const provider = this.config.provider;
    const system = messages
      .filter((message) => message.role === 'system')
      .map((message) => String(message.content || ''))
      .join('\n\n');
    const body = {
      systemInstruction: system
        ? { parts: [{ text: system }] }
        : undefined,
      contents: messages
        .filter((message) => message.role !== 'system')
        .map((message) => ({
          role: message.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: String(message.content || '') }],
        })),
      generationConfig: {
        temperature: Number(provider.request?.temperature ?? 0.1),
        maxOutputTokens: Number(provider.request?.max_tokens || 8192),
        responseMimeType: 'application/json',
      },
    };
    const base = trimTrailingSlash(
      provider.baseUrl || 'https://generativelanguage.googleapis.com/v1beta',
    );
    const url = `${base}/models/${encodeURIComponent(provider.model)}:generateContent?key=${encodeURIComponent(provider.apiKey)}`;
    const data = await nativeFetch(
      url,
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          ...(provider.headers || {}),
        },
        body: JSON.stringify(body),
      },
      provider,
      options,
    );
    const text = (data.candidates?.[0]?.content?.parts || [])
      .map((part) => part?.text || '')
      .join('');
    if (!text) throw new ProviderError('Gemini response did not include text.', { data });
    return text;
  }
}

export class MockProvider {
  constructor() {
    this.phase = 0;
    this.approvalRequested = false;
  }

  async complete(messages) {
    const taskContent = messages.find(
      (message) => message.role === 'user' && String(message.content).includes('Task:'),
    )?.content ?? '';
    const wantsApproval = /approval/i.test(taskContent);
    const sequence = [
      {
        reason: 'The smoke run needs an observable work order.',
        action: 'plan',
        args: {
          goal: 'Verify the coding execution loop',
          steps: [
            { id: '1', title: 'Inspect workspace status' },
            ...(wantsApproval ? [{ id: '2', title: 'Exercise operator approval' }] : []),
            { id: wantsApproval ? '3' : '2', title: 'Close the verified run' },
          ],
        },
      },
      {
        reason: 'I am beginning workspace inspection.',
        action: 'mark_step',
        args: { id: '1', status: 'in_progress', note: 'Inspecting the workspace.' },
      },
      {
        reason: 'The workspace status is the evidence needed for this smoke run.',
        action: 'workspace_status',
        expected: 'The workspace root and current top-level state will be returned.',
        verification: 'Confirm the tool result identifies the workspace and its files.',
        args: {},
      },
      {
        reason: 'Workspace inspection is complete.',
        action: 'mark_step',
        args: { id: '1', status: 'completed', note: 'Workspace status returned successfully.' },
      },
    ];

    if (wantsApproval) {
      sequence.push(
        {
          reason: 'I am opening the approval coordination step.',
          action: 'mark_step',
          args: { id: '2', status: 'in_progress', note: 'Requesting operator confirmation.' },
        },
        {
          reason: 'The task explicitly asks to verify the approval channel.',
          action: 'request_approval',
          args: {
            question: 'Approve the mock approval smoke test?',
            proposedAction: 'Continue to close the smoke run.',
            reason: 'This verifies the live approval path.',
          },
        },
        {
          reason: 'The approval channel returned a decision.',
          action: 'mark_step',
          args: { id: '2', status: 'completed', note: 'Approval response received.' },
        },
      );
    }

    const finalId = wantsApproval ? '3' : '2';
    sequence.push(
      {
        reason: 'I am closing the smoke run.',
        action: 'mark_step',
        args: { id: finalId, status: 'in_progress', note: 'Preparing the final evidence report.' },
      },
      {
        reason: 'The smoke run is ready to close.',
        action: 'mark_step',
        args: { id: finalId, status: 'completed', note: 'Execution loop verified.' },
      },
      {
        reason: 'The planned smoke workflow completed.',
        action: 'final',
        summary: wantsApproval
          ? 'Mock provider completed the planning, tool, and approval workflow.'
          : 'Mock provider completed the planning and tool workflow.',
        changedFiles: [],
        tests: [],
        notes: [],
      },
    );

    const action = sequence[Math.min(this.phase, sequence.length - 1)];
    this.phase += 1;
    return JSON.stringify(action);
  }
}

export function createProvider(config) {
  if (config.provider.type === 'mock') {
    return new MockProvider();
  }
  if (config.provider.type === 'anthropic') {
    return new AnthropicProvider(config);
  }
  if (config.provider.type === 'google') {
    return new GoogleProvider(config);
  }

  return new OpenAICompatibleProvider(config);
}
