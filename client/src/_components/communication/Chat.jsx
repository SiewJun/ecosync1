import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Send,
  Loader2,
  ArrowLeft,
  Building2,
  MoreVertical,
} from "lucide-react";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const BASE_URL = "http://localhost:5000/";

const ChatPage = () => {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const scrollAreaRef = useRef(null);
  const lastMessageRef = useRef(null);

  useEffect(() => {
    const fetchCompanyAndMessages = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        setLoading(true);
        const [companyResponse, messagesResponse] = await Promise.all([
          axios.get(`${BASE_URL}api/communication/companies/${companyId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${BASE_URL}api/communication/chats/${companyId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setCompany(companyResponse.data.company);
        setMessages(messagesResponse.data.messages);
      } catch (error) {
        if (error.response && error.response.status === 404) {
          setError("The chat or company you're looking for does not exist.");
        } else {
          console.error("Error fetching company or messages:", error);
          setError("An error occurred while fetching data.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyAndMessages();
  }, [companyId]);

  useEffect(() => {
    // Scroll to the bottom when messages are loaded or updated
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || sending) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      setSending(true);
      const response = await axios.post(
        `${BASE_URL}api/communication/chats/${companyId}/messages`,
        { content: message },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Assuming the server returns the message object with createdAt
      const newMessage = response.data.message;

      // Append the new message from the server response
      setMessages([...messages, newMessage]);
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      setError("An error occurred while sending the message.");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <p className="text-lg font-poppins font-semibold text-red-500">
          {error}
        </p>
        <Button
          onClick={() => navigate("/consumer-dashboard/chat")}
          variant="outline"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back to Chats
        </Button>
      </div>
    );
  }

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "Invalid date";
    try {
      return format(new Date(timestamp), "p");
    } catch (error) {
      console.error("Error formatting timestamp:", error);
      return "Invalid date";
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="p-4 shadow-sm border-b">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center space-x-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate("/consumer-dashboard/chat")}
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Back to Chats</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Avatar className="w-12 h-12 ring-2 ring-emerald-400 ring-offset-2 ring-offset-background">
              {company?.avatarUrl ? (
                <AvatarImage
                  src={`${BASE_URL}${company.avatarUrl}`}
                  alt={company?.companyName || "Company Avatar"}
                />
              ) : (
                <AvatarFallback>
                  <Building2 className="h-6 w-6 ring-emerald-400" />
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <h1 className="text-xl font-semibold">
                {company?.companyName || "Unknown Company"}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {company?.website || "No website"}
              </p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>View Company Profile</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <ScrollArea
        className="flex-1 p-4 h-0 min-h-0 max-h-full"
        ref={scrollAreaRef}
      >
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.length > 0 ? (
            messages.map((msg, index) => {
              const isCompanySender =
                String(company?.id) === String(msg.senderId);

              return (
                <div
                  key={index}
                  ref={index === messages.length - 1 ? lastMessageRef : null}
                  className={`flex ${
                    isCompanySender ? "justify-start" : "justify-end"
                  }`}
                >
                  <div
                    className={`p-3 rounded-lg max-w-[80%] shadow-sm ${
                      isCompanySender
                        ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        : "bg-primary text-primary-foreground"
                    }`}
                  >
                    <p className="text-sm">{msg.messageText}</p>
                    <p className="text-xs mt-1 opacity-70">
                      {formatTimestamp(msg.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-center mt-8 text-gray-500 dark:text-gray-400">
              No messages yet. Start the conversation!
            </p>
          )}
        </div>
      </ScrollArea>

      <form onSubmit={handleSendMessage} className="p-4 border-t">
        <div className="flex space-x-2 max-w-3xl mx-auto">
          <Input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 border"
          />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="submit"
                  disabled={sending}
                  className="bg-primary hover:bg-primary/90"
                >
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  <span className="ml-2 hidden sm:inline">Send</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Send Message</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </form>
    </div>
  );
};

export default ChatPage;
