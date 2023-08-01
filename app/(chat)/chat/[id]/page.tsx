import { redirect } from "next/navigation";
import { auth, redirectToSignIn } from "@clerk/nextjs";
import db from "@/lib/db";
import { ChatClient } from "./components/client";

interface ChatIdPageProps {
  params: {
    id: string;
  };
}

const ChatIdPage = async ({ params }: ChatIdPageProps) => {
  const { userId } = auth();

  if (!userId) {
    return redirectToSignIn();
  }

  const bot = await db.bot.findUnique({
    where: {
      id: params.id,
    },
    include: {
      messages: {
        orderBy: {
          createdAt: "asc",
        },
        where: {
          userId,
        },
      },
      _count: {
        select: {
          messages: true,
        },
      },
    },
  });

  if (!bot) {
    return redirect("/");
  }

  return <ChatClient bot={bot} />;
};

export default ChatIdPage;
