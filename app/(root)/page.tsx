import db from "@/lib/db";
import { SearchField } from "@/components/search-field";
import { BotList } from "@/components/bot-list";

interface RootPageProps {
  searchParams: {
    keyword: string;
  };
}

const RootPage = async ({ searchParams }: RootPageProps) => {
  const bots = await db.bot.findMany({
    where: {
      name: {
        search: searchParams.keyword,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      _count: {
        select: {
          messages: true,
        },
      },
    },
  });

  return (
    <div className="h-full p-4 space-y-2">
      <SearchField />
      <BotList data={bots} />
    </div>
  );
};

export default RootPage;
