import { StreamingTextResponse } from "ai";

export async function POST(request: Request) {
  const { prompt } = await request.json();
  const Readable = require("stream").Readable;
  const stream = new Readable();
  stream.push(prompt);
  stream.push(null);
  return new StreamingTextResponse(stream);
}
