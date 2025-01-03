import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MessageSquare,
  Building2,
  Loader2,
  ShieldCheck,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { io } from "socket.io-client"; // Import socket.io-client

const BASE_URL = "http://localhost:5000/";
const socket = io('http://localhost:5000/'); // Initialize socket connection

const ChatList = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${BASE_URL}api/communication/chats/consumer`,
          {
            withCredentials: true, // Include credentials in the request
          }
        );
        setChats(response.data.chats);
      } catch (error) {
        if (error.response && error.response.status === 404) {
          setChats([]); // No chats found
        } else {
          setError("Failed to load chats. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    };
  
    fetchChats();
  }, []);

  useEffect(() => {
    socket.on("receiveMessage", (newMessage) => {
      // Update the chat list when a new message is received
      setChats((prevChats) => {
        const updatedChats = [...prevChats];
        const chatIndex = updatedChats.findIndex(
          (chat) => chat.Company.id === newMessage.chatId
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
          className="mt-8 bg-red-600 hover:bg-red-700 text-white"
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="container p-6 space-y-8">
      <div className="max-w-5xl mx-auto">
        <ScrollArea className="h-[calc(100vh-200px)] pr-4">
          {chats.length ? (
            <div className="space-y-4">
              {chats.map((chat) => (
                <Link
                  key={chat.Company.id}
                  to={`/consumer-dashboard/chat/${chat.Company.id}`}
                  className="block"
                >
                  <Card className="hover:bg-accent transition-colors">
                    <CardContent className="flex items-center p-4">
                      <Avatar className="w-12 h-12">
                        {chat.Company.avatarUrl ? (
                          <AvatarImage
                            src={`${BASE_URL}${chat.Company.avatarUrl}`}
                            alt={chat.Company.companyName}
                          />
                        ) : (
                          <AvatarFallback>
                            <Building2 className="h-6 w-6 text-muted-foreground" />
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="ml-4 flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <h4 className="text-xl font-semibold">
                            {chat.Company.CompanyDetail.companyName}
                          </h4>
                        </div>
                        <div className="flex md:flex-row flex-sm space-x-2">
                          {chat.Company.CompanyDetail.businessLicense && (
                            <Badge
                              variant="secondary"
                              className="flex items-center space-x-1"
                            >
                              <ShieldCheck className="w-3 h-3" />
                              <span>Pre-screened</span>
                            </Badge>
                          )}
                          {chat.Company.CompanyProfile.certificate && (
                            <Badge
                              variant="outline"
                              className="flex items-center space-x-1"
                            >
                              <CheckCircle className="w-3 h-3" />
                              <span>Certified</span>
                            </Badge>
                          )}
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
    </div>
  );
};

export default ChatList;