import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2, ArrowLeft, Building2 } from "lucide-react";
import { format } from "date-fns";

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

  useEffect(() => {
    const fetchCompanyAndMessages = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token || !companyId) return;

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
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || sending) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      setSending(true);
      await axios.post(
        `${BASE_URL}api/communication/chats/${companyId}/messages`,
        { content: message },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessages([...messages, { content: message, sender: "consumer", timestamp: new Date() }]);
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
        <p className="text-lg font-poppins font-semibold text-red-500">{error}</p>
        <Button onClick={() => navigate("/consumer-dashboard/chat")} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back to Chats
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-0">
      <header className="p-4 shadow-md border rounded-md">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/consumer-dashboard/chat")}
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Avatar className="w-12 h-12">
            {company?.avatarUrl ? (
              <AvatarImage
                src={`${BASE_URL}${company.avatarUrl}`}
                alt={company?.companyName || "Company Avatar"}
              />
            ) : (
              <AvatarFallback>
                <Building2 className="h-6 w-6 text-muted-foreground" />
              </AvatarFallback>
            )}
          </Avatar>
          <div>
            <h1 className="text-xl font-semibold">{company?.companyName || "Unknown Company"}</h1>
            <p className="text-sm">{company?.overview || "No description available"}</p>
          </div>
        </div>
      </header>

      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        {messages.length > 0 ? (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`mb-4 ${
                msg.sender === "consumer" ? "flex justify-end" : "flex justify-start"
              }`}
            >
              <div
                className={`p-3 rounded-lg ${
                  msg.sender === "consumer"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground"
                } max-w-[80%] shadow-sm`}
              >
                <p>{msg.content}</p>
                <p className="text-xs mt-1 opacity-70">
                  {format(new Date(msg.timestamp), "MMM d, h:mm a")}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center mt-8">No messages yet. Start the conversation!</p>
        )}
      </ScrollArea>

      <form onSubmit={handleSendMessage} className="p-4 border-t">
        <div className="flex space-x-2">
          <Input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1"
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

export default ChatPage;