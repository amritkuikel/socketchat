"use client";

import axiosInstance from "@/lib/axiosInterceptor";
import { Chat, User, Message } from "@/lib/types";
import React, { useEffect, useRef, useState } from "react";
import io, { Socket } from "socket.io-client";
import ChatInput from "./chatInput";

interface MainProps {
  id: string;
}

const Main: React.FC<MainProps> = ({ id }) => {
  const [chat, setChat] = useState<Chat | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  // Fetch user profile
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axiosInstance.get("/auth/profile");
        setUser(response.data);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    }
    fetchData();
  }, []);

  // Initialize socket only after user is set
  useEffect(() => {
    if (user?.id) {
      const socket = io("http://localhost:3000", {
        query: { userId: user.id.toString() },
      });

      socket.on("connect", () => {
        console.log("Connected to server:", socket.id);
      });

      socket.on("message", (message: Message) => {
        console.log("Message received from server:", message);
        setChat((prevChat) => {
          if (!prevChat) return prevChat;
          return { ...prevChat, messages: [...prevChat.messages, message] };
        });
        scrollToBottom();
      });

      socket.on("disconnect", () => {
        console.log("Disconnected from server");
      });

      socketRef.current = socket;

      return () => {
        socket.off("connect");
        socket.off("message");
        socket.off("disconnect");
        socket.close();
      };
    }
  }, [user]);

  // Fetch chat data
  const fetchChatData = async () => {
    if (!id) {
      console.error("ID is undefined");
      return;
    }

    try {
      const response = await axiosInstance.get(`/chat/${id}`);
      setChat(response.data);
      scrollToBottom();
    } catch (error) {
      console.error("Error fetching chat data:", error);
    }
  };

  useEffect(() => {
    fetchChatData();
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [chat]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const sendMessage = (message: string) => {
    if (message.trim() && user?.id) {
      const receiverId = chat?.users.find((u) => u.id !== user.id)?.id.toString();
      if (!receiverId) {
        console.error("Receiver ID not found");
        return;
      }
      const messagePayload = {
        chatId: id,
        senderId: user.id.toString(),
        receiverId: receiverId,
        message,
      };
      console.log("Sending message:", messagePayload);
      socketRef.current?.emit("message", messagePayload);
    }
  };

  return (
    <div className="bg-orange-800 w-[80vw] h-[90vh] p-6 flex flex-col justify-between">
      <div className="overflow-y-auto flex-grow">
        <div className="sticky top-0 font-bold bg-slate-700 p-2 rounded mb-2 text-center">
          {chat?.users.map((user) => user.name).join(", ")}
        </div>
        <div>
          {chat?.messages.map((message) => (
            <div
              key={message.id}
              className={`flex flex-col ${
                user?.id === message.senderId ? "items-end" : ""
              }`}
            >
              <div className="bg-gray-500 m-2 p-2 w-72">{message.message}</div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="mt-4">
        {user && (
          <ChatInput chatId={id} userId={user.id} sendMessage={sendMessage} />
        )}
      </div>
    </div>
  );
};

export default Main;
