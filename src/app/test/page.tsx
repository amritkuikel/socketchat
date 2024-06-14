"use client";
import { useEffect, useState, ChangeEvent } from "react";
import io, { Socket } from "socket.io-client";

interface Message {
  id: number;
  message: string;
  senderId: number;
  chatId: number;
}

const userId = "1"; // Replace this with the actual user ID from your authentication logic
const chatId = 1; // Replace this with the actual chat ID

const socket: Socket = io("http://localhost:3000", {
  query: { userId }, // Pass the user ID as a query parameter
});

const Home: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const [receiverId, setReceiverId] = useState<string>(""); // Receiver's user ID

  useEffect(() => {
    // Log connection status
    socket.on("connect", () => {
      console.log("Connected to server:", socket.id);
    });

    // Listen for incoming messages
    socket.on("message", (message: any) => {
      console.log("Message received from server:", message);
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    // Log disconnection status
    socket.on("disconnect", () => {
      console.log("Disconnected from server");
    });

    // Cleanup on unmount
    return () => {
      socket.off("connect");
      socket.off("message");
      socket.off("disconnect");
    };
  }, []);

  const sendMessage = () => {
    if (input.trim() && receiverId.trim()) {
      const messagePayload = {
        receiverId,
        senderId: userId,
        chatId,
        message: input,
      };
      console.log("Sending message:", messagePayload);
      socket.emit("message", messagePayload);
      setInput("");
    }
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInput(event.target.value);
  };

  const handleReceiverChange = (event: ChangeEvent<HTMLInputElement>) => {
    setReceiverId(event.target.value);
  };

  return (
    <div>
      <h1>Chat</h1>
      <div>
        {messages.map((msg) => (
          <div key={msg.id}>
            <strong>{msg.senderId}: </strong>
            <span>{msg.message}</span>
          </div>
        ))}
      </div>
      <input
        type="text"
        placeholder="Receiver ID"
        value={receiverId}
        onChange={handleReceiverChange}
      />
      <input
        type="text"
        placeholder="Message"
        value={input}
        onChange={handleInputChange}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default Home;
