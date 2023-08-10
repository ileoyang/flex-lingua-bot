import { StreamingTextResponse, LangChainStream } from "ai";
import { currentUser } from "@clerk/nextjs";
import { Replicate } from "langchain/llms/replicate";
import { CallbackManager } from "langchain/callbacks";
import { NextResponse } from "next/server";
import { MemoryManager } from "@/lib/memory";
import { rateLimit } from "@/lib/rate-limit";
import db from "@/lib/db";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { prompt } = await request.json();
    const user = await currentUser();

    if (!user || !user.firstName || !user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const identifier = request.url + "-" + user.id;
    const { success } = await rateLimit(identifier);

    if (!success) {
      return new NextResponse("Rate limit exceeded", { status: 429 });
    }

    const bot = await db.bot.update({
      where: {
        id: params.id,
      },
      data: {
        messages: {
          create: {
            content: prompt,
            role: "user",
            userId: user.id,
          },
        },
      },
    });

    if (!bot) {
      return new NextResponse("bot not found", { status: 404 });
    }

    const botKey = {
      botId: bot.id,
      userId: user.id,
      modelName: "llama2-13b",
    };
    const memoryManager = await MemoryManager.getInstance();

    const records = await memoryManager.readLatestHistory(botKey);
    if (records.length === 0) {
      await memoryManager.seedChatHistory(bot.conversation, "\n\n", botKey);
    }
    await memoryManager.writeToHistory("User: " + prompt + "\n", botKey);

    const recentChatHistory = await memoryManager.readLatestHistory(botKey);

    const { handlers } = LangChainStream();
    const model = new Replicate({
      model:
        "a16z-infra/llama-2-13b-chat:df7690f1994d94e96ad9d568eac121aecf50684a0b0963b25a41cc40061269e5",
      input: {
        max_length: 2048,
      },
      apiKey: process.env.REPLICATE_API_TOKEN,
      callbackManager: CallbackManager.fromHandlers(handlers),
    });

    const resp = String(
      await model
        .call(
          `
        ONLY generate plain sentences without prefix of who is speaking. DO NOT use ${bot.name}: prefix. 

        ${bot.instruction}

        Below are relevant details about ${bot.name}'s past and the conversation you are in.

        ${recentChatHistory}\n${bot.name}:`
        )
        .catch(console.error)
    );

    const cleaned = resp.replaceAll(",", "");
    const chunks = cleaned.split("\n");
    const response = chunks[0];

    await memoryManager.writeToHistory("" + response.trim(), botKey);
    const Readable = require("stream").Readable;

    const stream = new Readable();
    stream.push(response);
    stream.push(null);
    if (response !== undefined && response.length > 1) {
      memoryManager.writeToHistory("" + response.trim(), botKey);
      await db.bot.update({
        where: {
          id: params.id,
        },
        data: {
          messages: {
            create: {
              content: response.trim(),
              role: "system",
              userId: user.id,
            },
          },
        },
      });
    }

    return new StreamingTextResponse(stream);
  } catch (error) {
    console.log("Chat API error", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
