import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2, ArrowLeft, User, MoreVertical } from "lucide-react";
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

const ChatCompany = () => {
  const { consumerId } = useParams();
  const navigate = useNavigate();
  const [consumer, setConsumer] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const scrollAreaRef = useRef(null);
  const lastMessageRef = useRef(null);
  const [attachment, setAttachment] = useState(null);

  useEffect(() => {
    const fetchCompanyAndMessages = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        setLoading(true);

        const [consumerResponse, messagesResponse] = await Promise.all([
          axios.get(`${BASE_URL}api/communication/consumers/${consumerId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(
            `${BASE_URL}api/communication/company-chats/${consumerId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          ),
        ]);

        setConsumer(consumerResponse.data.consumer);
        // Sort messages by createdAt timestamp
        const sortedMessages = messagesResponse.data.messages.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
        setMessages(sortedMessages);
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
  }, [consumerId]);

  useEffect(() => {
    // Scroll to the bottom when messages are loaded or updated
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!message.trim() && !attachment) || sending) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const formData = new FormData();
      formData.append("content", message);
      if (attachment) formData.append("attachment", attachment);

      setSending(true);
      const response = await axios.post(
        `${BASE_URL}api/communication/company-chats/${consumerId}/messages`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const newMessage = response.data.message;
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setMessage("");
      setAttachment(null);
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
                    onClick={() => navigate("/company-dashboard/company-chat")}
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
              {consumer?.avatarUrl ? (
                <AvatarImage
                  src={`${BASE_URL}${consumer.avatarUrl}`}
                  alt={consumer?.companyName || "Company Avatar"}
                />
              ) : (
                <AvatarFallback>
                  <User className="h-6 w-6 ring-emerald-400" />
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <h1 className="text-xl font-semibold">
                {consumer?.username || "Unknown Company"}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {consumer?.role
                  ? consumer.role.charAt(0).toUpperCase() +
                    consumer.role.slice(1).toLowerCase()
                  : "No data"}
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
              <DropdownMenuItem>View User Profile</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <ScrollArea
        className="flex-1 p-4 h-0 min-h-0 max-h-full"
        ref={scrollAreaRef}
      >
        <div className="max-w-3xl mx-auto space-y-4">
          {messages?.length > 0 ? (
            messages.map((msg, index) => (
              <div
                key={index}
                ref={index === messages.length - 1 ? lastMessageRef : null}
                className={`flex ${
                  consumer?.id !== msg.senderId
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`p-3 rounded-lg max-w-[80%] shadow-sm ${
                    consumer?.id !== msg.senderId
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary"
                  }`}
                >
                  {msg.attachments && msg.attachments.length > 0 ? (
                    msg.attachments.map((attachment) =>
                      attachment.fileType === "image" ? (
                        <img
                          key={attachment.id}
                          src={`${BASE_URL}${attachment.filePath}`}
                          alt="attachment"
                          className="max-w-full rounded-lg"
                        />
                      ) : attachment.fileType === "document" ? (
                        <a
                          key={attachment.id}
                          href={`${BASE_URL}${attachment.filePath}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline"
                        >
                          Download Document
                        </a>
                      ) : (
                        <a
                          key={attachment.id}
                          href={`${BASE_URL}${attachment.filePath}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline"
                        >
                          Download Attachment
                        </a>
                      )
                    )
                  ) : (
                    <p>{msg.messageText}</p>
                  )}
                  <p className="text-xs mt-1 opacity-70">
                    {formatTimestamp(msg.createdAt)}
                  </p>
                </div>
              </div>
            ))
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
          <input
            type="file"
            onChange={(e) => setAttachment(e.target.files[0])}
          />
          <Button type="submit" disabled={sending}>
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            <span className="ml-2 hidden sm:inline">Send</span>
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatCompany;