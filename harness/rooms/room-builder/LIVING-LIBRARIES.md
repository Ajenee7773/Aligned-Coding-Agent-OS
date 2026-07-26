# Compiling a Living Library

Any personal room created here can become a distributable Living Library.

After the room is complete and its `room.json` and `README.md` have been read
back successfully, tell the operator:

> Your room is ready. Use Export on its Rooms card whenever you want to compile
> it as a Living Library.

The OS—not the model—performs packaging. It:

1. validates the room identifier and required files;
2. converts the exported catalog card to `kind: living-library`;
3. embeds only supported UTF-8 room files;
4. records byte counts and SHA-256 hashes;
5. signs the complete package identity with one digest;
6. downloads one `.living-library.json` file.

Another Aligned Agent OS installs that file through **Install Library**. The OS
checks every path and hash before placing the library in Rooms. It never
overwrites an existing room.

Do not place credentials, private keys, chat logs, unrelated personal files, or
copyrighted source material the operator is not authorized to distribute into
an exportable room.
