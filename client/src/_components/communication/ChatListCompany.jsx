import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MessageSquare,
  User,
  Loader2,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { io } from "socket.io-client"; // Import socket.io-client

const BASE_URL = "http://localhost:5000/";
const socket = io("http://localhost:5000/"); // Initialize socket connection

const ITEMS_PER_PAGE = 10;

const ChatListCompany = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}api/communication/chats/company`,
          {
            withCredentials: true, // Include credentials in the request
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

  const filteredChats = chats.filter((chat) =>
    chat.Consumer.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredChats.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentChats = filteredChats.slice(startIndex, endIndex);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
      <div className="flex justify-end mb-4">
        <div className="relative w-full md:w-1/3">
          <Input
            type="text"
            placeholder="Search chats..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
      </div>
      <ScrollArea className="h-[calc(100vh-200px)] pr-4">
        {currentChats.length ? (
          <div className="space-y-4">
            {currentChats.map((chat) => (
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
      {totalPages > 1 && (
        <div className="flex justify-center mt-8 space-x-2">
          <Button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            variant="outline"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {Array.from({ length: totalPages }, (_, index) => (
            <Button
              key={index + 1}
              onClick={() => handlePageChange(index + 1)}
              variant={currentPage === index + 1 ? "default" : "outline"}
            >
              {index + 1}
            </Button>
          ))}
          <Button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            variant="outline"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default ChatListCompany;
