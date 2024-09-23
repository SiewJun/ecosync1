import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Building2, FileText} from "lucide-react";

const ConsumerQuotation = () => {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuotations = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:5000/api/quotation/consumer-quotations",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setQuotations(response.data.quotations);
        console.log(response.data.quotations);
      } catch (error) {
        if (error.response && error.response.status === 404) {
          setQuotations([]); // No quotations found
        } else {
          setError("Failed to load quotations. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchQuotations();
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
      </div>
    );
  }

  return (
    <div className="max-w-5xl container mx-auto p-6 space-y-8">
      <ScrollArea className="h-[calc(100vh-200px)] pr-4">
        {quotations.length ? (
          <div className="space-y-4">
            {quotations.map((quotation) => (
              quotation.company ? (
                <Link
                  key={quotation.company.id}
                  to={`/consumer-dashboard/quotation/${quotation.company.id}`}
                  className="block"
                >
                  <Card className="hover:bg-accent transition-colors">
                    <CardContent className="flex items-center p-4">
                      <Avatar className="w-12 h-12">
                        {quotation.company.avatarUrl ? (
                          <AvatarImage
                            src={`http://localhost:5000/${quotation.company.avatarUrl}`}
                            alt={quotation.company.CompanyDetail.companyName}
                          />
                        ) : (
                          <AvatarFallback>
                            <Building2 className="h-6 w-6 text-muted-foreground" />
                        </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="ml-4">
                        <h3 className="text-lg font-semibold">
                          {quotation.company.CompanyDetail.companyName}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {quotation.company.CompanyDetail.companyDescription}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ) : null
            ))}
          </div>
        ) : (
          <Card className="bg-muted">
            <CardContent className="flex flex-col items-center justify-center h-32">
              <FileText className="h-8 w-8 text-muted-foreground mb-2" />
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

export default ConsumerQuotation;
