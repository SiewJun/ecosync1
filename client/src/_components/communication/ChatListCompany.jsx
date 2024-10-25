import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { MessageSquare, User, Loader2 } from "lucide-react";
import { io } from "socket.io-client"; // Import socket.io-client

const BASE_URL = "http://localhost:5000/";
const socket = io('http://localhost:5000/'); // Initialize socket connection

const ChatListCompany = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${BASE_URL}api/communication/chats/company`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setChats(response.data.chats);
      } catch (error) {
        console.error("Error fetching company messages:", error);
        setError("Failed to load messages. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  useEffect(() => {
    socket.on("receiveMessage", (newMessage) => {
      // Update the chat list when a new message is received
      setChats((prevChats) => {
        const updatedChats = [...prevChats];
        const chatIndex = updatedChats.findIndex(
          (chat) => chat.consumerId === newMessage.chatId
        );
        if (chatIndex !== -1) {
          updatedChats[chatIndex].Messages.push(newMessage);
        }
        return updatedChats;
      });
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        <p>{error}</p>
        <Button
          variant="destructive"
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl container mx-auto p-6 space-y-8">
      <ScrollArea className="h-[calc(100vh-200px)] pr-4">
        {chats.length ? (
          <div className="space-y-4">
            {chats.map((chat) => (
              <Link
                key={chat.consumerId}
                to={`/company-dashboard/company-chat/${chat.consumerId}`}
                className="block"
              >
                <Card className="hover:bg-accent transition-colors">
                  <CardContent className="flex items-center p-4">
                    <Avatar className="w-12 h-12">
                      {chat.Consumer.avatarUrl ? (
                        <AvatarImage
                          src={`${BASE_URL}${chat.Consumer.avatarUrl}`}
                          alt={chat.username}
                        />
                      ) : (
                        <AvatarFallback>
                          <User className="h-6 w-6 text-muted-foreground" />
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="ml-4 flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <h4 className="text-xl font-semibold">
                          {chat.Consumer.username}
                        </h4>
                      </div>
                    </div>
                    <MessageSquare className="h-6 w-6 text-muted-foreground" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="bg-muted">
            <CardContent className="flex flex-col items-center justify-center h-32">
              <MessageSquare className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-center text-sm text-muted-foreground">
                No chats available.
              </p>
            </CardContent>
          </Card>
        )}
      </ScrollArea>
    </div>
  );
};

export default ChatListCompany;