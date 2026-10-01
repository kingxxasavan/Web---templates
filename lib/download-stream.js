import { createReadStream } from "node:fs";
import { Readable } from "node:stream";

// Keep large bundles out of memory and send them as a streaming response.
export const downloadStream = file => Readable.toWeb(createReadStream(file));
