import { currentUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const user = await currentUser();
    const { avatarSrc, name, description, instruction, conversation } = body;

    if (!user || !user.id || !user.firstName) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!avatarSrc || !name || !description || !instruction || !conversation) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const bot = await db.bot.create({
      data: {
        userId: user.id,
        userName: user.firstName,
        avatarSrc,
        name,
        description,
        instruction,
        conversation,
      },
    });

    return NextResponse.json(bot);
  } catch (error) {
    console.log("[BOT_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
