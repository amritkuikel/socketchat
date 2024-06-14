"use client";
import React, { useEffect, useState } from "react";
import axiosInstance from "@/lib/axiosInterceptor";
import Cookies from 'js-cookie'; 
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "./ui/button";

const NavBar = () => {
  const [user, setUser] = useState<any>({});
  const [users, setUsers] = useState<any[]>([]);
  async function handleClick(params:number) {
    try {
      const response = await axiosInstance.post("/chat", { userIds: [user.id, params] });
      window.location.reload();
    } catch (error) {
      console.error("Error creating chat:", error);
    }
  }
  async function logoutHandler() {
    try {
      Cookies.remove("token");
      window.location.reload();
    } catch (error) {
      console.error("Error logging out:", error);
    }
  }
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axiosInstance.get("/auth/profile");
        const response2 = await axiosInstance.get("/user");
        setUser(response.data);
        setUsers(response2.data);
      } catch (error) {
        console.error(error);
      }
    }
    fetchData();
  }, []);
  return (
    <div className="text-center p-4 bg-gray-600 font-extrabold text-2xl flex justify-center gap-12">
      <div>{user.name}</div>
      <div className="mx">
        <DropdownMenu>
          <DropdownMenuTrigger>[+]</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Message Peoples</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {users?.map((user:any)=>(<DropdownMenuItem onClick={()=>{handleClick(user.id)}}>{user.name}</DropdownMenuItem>))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Button onClick={logoutHandler}>Logout</Button>
    </div>
  );
};

export default NavBar;
