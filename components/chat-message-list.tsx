"use client";

import { ElementRef, useEffect, useRef, useState } from "react";
import { Bot } from "@prisma/client";
import { ChatMessage, ChatMessageProps } from "@/components/chat-message";

interface ChatMessageListProps {
  messages: ChatMessageProps[];
  isLoading: boolean;
  bot: Bot;
}

export const ChatMessageList = ({
  messages = [],
  isLoading,
  bot,
}: ChatMessageListProps) => {
  const scrollRef = useRef<ElementRef<"div">>(null);

  const [fakeLoading, setFakeLoading] = useState(
    messages.length === 0 ? true : false
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      setFakeLoading(false);
    }, 1000);

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    scrollRef?.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  return (
    <div className="flex-1 overflow-y-auto pr-4">
      <ChatMessage
        isLoading={fakeLoading}
        src={bot.avatarSrc}
        role="system"
        content={`Hello, I am ${bot.name}, ${bot.description}`}
      />
      {messages.map((message) => (
        <ChatMessage
          key={message.content}
          src={bot.avatarSrc}
          content={message.content}
          role={message.role}
        />
      ))}
      {isLoading && <ChatMessage src={bot.avatarSrc} role="system" isLoading />}
      <div ref={scrollRef} />
    </div>
  );
};
