import { Redis } from "@upstash/redis";

export type BotKey = {
  botId: string;
  modelName: string;
  userId: string;
};

export class MemoryManager {
  private static instance: MemoryManager;
  private redisInstance: Redis;

  public constructor() {
    this.redisInstance = Redis.fromEnv();
  }

  public static async getInstance(): Promise<MemoryManager> {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager();
    }
    return MemoryManager.instance;
  }

  private generateRedisbotKey(botKey: BotKey): string {
    return `${botKey.botId}-${botKey.modelName}-${botKey.userId}`;
  }

  public async writeToHistory(text: string, botKey: BotKey) {
    if (!botKey || typeof botKey.userId == "undefined") {
      console.log("bot key set incorrectly");
      return "";
    }
    const key = this.generateRedisbotKey(botKey);
    const result = await this.redisInstance.zadd(key, {
      score: Date.now(),
      member: text,
    });
    return result;
  }

  public async readLatestHistory(botKey: BotKey): Promise<string> {
    if (!botKey || typeof botKey.userId == "undefined") {
      console.log("bot key set incorrectly");
      return "";
    }
    const key = this.generateRedisbotKey(botKey);
    let result = await this.redisInstance.zrange(key, 0, Date.now(), {
      byScore: true,
    });
    result = result.slice(-30).reverse();
    const recentChats = result.reverse().join("\n");
    return recentChats;
  }

  public async seedChatHistory(
    seedContent: String,
    delimiter: string = "\n",
    botKey: BotKey
  ) {
    const key = this.generateRedisbotKey(botKey);
    if (await this.redisInstance.exists(key)) {
      console.log("User already has chat history");
      return;
    }
    const content = seedContent.split(delimiter);
    let counter = 0;
    for (const line of content) {
      await this.redisInstance.zadd(key, { score: counter, member: line });
      counter += 1;
    }
  }
}
