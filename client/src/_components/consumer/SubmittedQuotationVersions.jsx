import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Loader2, FileText, ArrowLeftCircle, ArrowRightCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";

const SubmittedQuotationVersions = () => {
  const { quotationId } = useParams();
  const navigate = useNavigate();
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSubmittedVersions = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/quotation/submitted-versions/${quotationId}`,
          { withCredentials: true }
        );
        setVersions(response.data.versions);
      // eslint-disable-next-line no-unused-vars
      } catch (error) {
        setError("Failed to load submitted quotation versions. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchSubmittedVersions();
  }, [quotationId]);

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
    <div className="min-h-screen container p-6">
      <Toaster />
      <Link
        to={-1}
        className="inline-flex items-center text-primary hover:text-black dark:hover:text-white mb-4"
      >
        <ArrowLeftCircle className="mr-2" size={16} />
        Back
      </Link>
      <div className="max-w-5xl mx-auto">
        <h1 className="text-lg font-bold mb-6">Quotation Versions</h1>
          {versions.length ? (
            <div className="space-y-4">
              {versions.map((version) => (
                <div
                  key={version.id}
                  className="flex justify-between items-center p-4 border rounded-lg shadow-sm cursor-pointer hover:bg-primary transition duration-200"
                  onClick={() => navigate(`/consumer-dashboard/consumer-quotation/${version.id}`)}
                >
                  <div className="flex items-center space-x-4">
                    <span className="text-lg font-semibold">Version {version.versionNumber}</span>
                    <span className="text-sm">{new Date(version.updatedAt).toLocaleDateString()}</span>
                  </div>
                  <ArrowRightCircle className="text-foregrond" size={20} />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-32">
              <FileText className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-center text-sm text-muted-foreground">
                No submitted quotation versions available.
              </p>
            </div>
          )}
      </div>
    </div>
  );
};

export default SubmittedQuotationVersions;