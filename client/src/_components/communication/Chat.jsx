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
  Paperclip,
  X,
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
import { io } from "socket.io-client"; // Import socket.io-client

const BASE_URL = "http://localhost:5000/";
const socket = io(BASE_URL); // Initialize socket connection

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
  const [attachment, setAttachment] = useState(null);
  const fileInputRef = useRef(null);
  const messageIds = useRef(new Set());
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

  useEffect(() => {
    const fetchCompanyAndMessages = async () => {
      try {
        setLoading(true);
        const [companyResponse, messagesResponse] = await Promise.all([
          axios.get(`${BASE_URL}api/communication/companies/${companyId}`, {
            withCredentials: true, // Include credentials in the request
          }),
          axios.get(`${BASE_URL}api/communication/chats/${companyId}`, {
            withCredentials: true, // Include credentials in the request
          }),
        ]);
  
        setCompany(companyResponse.data.company);
        const sortedMessages = messagesResponse.data.messages.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
        setMessages(sortedMessages);
        sortedMessages.forEach(msg => messageIds.current.add(msg.id));
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
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    socket.on("receiveMessage", (newMessage) => {
      if (!messageIds.current.has(newMessage.id)) {
        setMessages((prevMessages) => [...prevMessages, newMessage]);
        messageIds.current.add(newMessage.id);
      }
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!message.trim() && !attachment) || sending) return;
  
    try {
      const formData = new FormData();
      formData.append("content", message);
      if (attachment) formData.append("attachment", attachment);
  
      setSending(true);
      const response = await axios.post(
        `${BASE_URL}api/communication/chats/${companyId}/messages`,
        formData,
        {
          withCredentials: true, // Include credentials in the request
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
  
      const newMessage = response.data.message;
      socket.emit("sendMessage", newMessage); // Emit the message to the server
      if (!messageIds.current.has(newMessage.id)) {
        setMessages((prevMessages) => [...prevMessages, newMessage]);
        messageIds.current.add(newMessage.id);
      }
      setMessage("");
      setAttachment(null);
    } catch (error) {
      console.error("Error sending message:", error);
      setError("An error occurred while sending the message.");
    } finally {
      setSending(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        alert("File size exceeds the 5MB limit. Please choose a smaller file.");
        fileInputRef.current.value = ""; // Clear the file input
        return;
      }
      setAttachment(file);
    }
  };

  const removeAttachment = () => {
    setAttachment(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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

  const handleViewCompanyProfile = () => {
    navigate(`/installers/companypublicprofile/${company?.id}`)
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="p-4 shadow-md border-b">
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
            <Avatar className="w-12 h-12 ring-2 ring-primary ring-offset-2 ring-offset-background">
              {company?.avatarUrl ? (
                <AvatarImage
                  src={`${BASE_URL}${company.avatarUrl}`}
                  alt={company?.companyName || "Company Avatar"}
                />
              ) : (
                <AvatarFallback>
                  <Building2 className="h-6 w-6 text-primary" />
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <h1 className="text-xl font-semibold">
                {company?.companyName || "Unknown Company"}
              </h1>
              <p className="text-sm">
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
              <DropdownMenuItem onClick={handleViewCompanyProfile}>View Company Profile</DropdownMenuItem>
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
                String(company?.id) !== String(msg.senderId);

              return (
                <div
                  key={index}
                  ref={index === messages.length - 1 ? lastMessageRef : null}
                  className={`flex ${
                    isCompanySender ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`p-3 rounded-lg max-w-[80%] shadow-sm ${
                      isCompanySender
                        ? "bg-primary text-primary-foreground"
                        : "bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    }`}
                  >
                    {msg.attachments && msg.attachments.length > 0 ? (
                      msg.attachments.map((attachment) =>
                        attachment.fileType === "image" ? (
                          <img
                            key={attachment.id}
                            src={`${BASE_URL}${attachment.filePath}`}
                            alt="attachment"
                            className="max-w-full rounded-lg mb-2"
                          />
                        ) : (
                          <a
                            key={attachment.id}
                            href={`${BASE_URL}${attachment.filePath}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline block mb-2"
                          >
                            {attachment.fileType === "document"
                              ? "Download Document"
                              : "Download Attachment"}
                          </a>
                        )
                      )
                    ) : null}
                    {msg.messageText && <p>{msg.messageText}</p>}
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
        <div className="flex items-end space-x-2 max-w-3xl mx-auto">
          <div className="flex-1 relative">
            <Input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="pr-10 py-2 rounded-full border-gray-300 dark:border-gray-600 focus:ring-primary focus:border-primary"
            />
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="absolute right-3 bottom-2 cursor-pointer text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <Paperclip className="h-5 w-5" />
            </label>
          </div>
          <Button
            type="submit"
            disabled={sending}
            variant="default"
            className="rounded-full px-4 py-2"
          >
            {sending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
            <span className="ml-2 hidden sm:inline">Send</span>
          </Button>
        </div>
        {attachment && (
          <div className="mt-2 flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
            <Paperclip className="h-4 w-4" />
            <span className="truncate">{attachment.name}</span>
            <button
              type="button"
              onClick={removeAttachment}
              className="text-red-500 hover:text-red-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default ChatPage;