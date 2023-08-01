import db from "@/lib/db";
import { BotForm } from "./components/bot-form";

interface BotPageProps {
  params: {
    id: string;
  };
}

const BotPage = async ({ params }: BotPageProps) => {
  const bot = await db.bot.findUnique({
    where: {
      id: params.id,
    },
  });

  return <BotForm initialData={bot} />;
};

export default BotPage;
