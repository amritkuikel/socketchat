"use client";
import React, { useEffect, useState } from "react";
import axiosInstance from "@/lib/axiosInterceptor";
import { Chat } from "@/lib/types";
import { useRouter } from "next/navigation";

const SideBar = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [user, setUser] = useState<any>({});
  const router = useRouter();

  useEffect(() => {
    async function fetchUserData() {
      try {
        const response = await axiosInstance.get("/auth/profile");
        setUser(response.data);
      } catch (error) {
        console.error(error);
      }
    }
    fetchUserData();
  }, []);

  useEffect(() => {
    if (!user.id) return;

    async function fetchChatData() {
      try {
        const response = await axiosInstance.get(`/chat/user/${user.id}`);
        setChats(response.data.chats);
      } catch (error) {
        console.error(error);
      }
    }
    fetchChatData();
  }, [user.id]);

  const handleChatClick = (chatId: number) => {
    router.push(`/chat/${chatId}`);
  };

  return (
    <div className="w-[25vw] bg-stone-500 h-[90vh] text-center capitalize font-bold py-6">
      <ul>
        {chats.map((chat) => (
          <li
            key={chat.id}
            className="my-2 py-2 bg-lime-900 cursor-pointer"
            onClick={() => handleChatClick(chat.id)}
          >
            {chat.users
              .filter((chatUser) => chatUser.id !== user.id)
              .map((chatUser) => (
                <div key={chatUser.id}>{chatUser.name}</div>
              ))}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SideBar;
