import { auth, currentUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const user = await currentUser();
    const { avatarSrc, name, description, instruction, conversation } = body;

    if (!params.id) {
      return new NextResponse("bot ID required", { status: 400 });
    }

    if (!user || !user.id || !user.firstName) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!avatarSrc || !name || !description || !instruction || !conversation) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const bot = await db.bot.update({
      where: {
        id: params.id,
        userId: user.id,
      },
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
    console.log("[bot_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const bot = await db.bot.delete({
      where: {
        userId,
        id: params.id,
      },
    });

    return NextResponse.json(bot);
  } catch (error) {
    console.log("[bot_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
