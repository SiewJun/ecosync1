import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AlertCircle, ArrowLeftCircle } from "lucide-react";
import axios from "axios";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast"; // Import useToast
import { Toaster } from "@/components/ui/toaster"; // Import Toaster

const UpdateSolutionForm = () => {
  const { id } = useParams();
  const [solutionName, setSolutionName] = useState("");
  const [solarPanelType, setSolarPanelType] = useState("");
  const [powerOutput, setPowerOutput] = useState("");
  const [efficiency, setEfficiency] = useState("");
  const [warranty, setWarranty] = useState("");
  const [price, setPrice] = useState("");
  const [solutionPic, setSolutionPic] = useState(null);
  const [currentPicUrl, setCurrentPicUrl] = useState(""); // To hold the current picture URL
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { toast } = useToast(); // Use the toast hook
  const BASE_URL = "http://localhost:5000";
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  useEffect(() => {
    // Fetch the existing data for the solution
    const fetchSolution = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/company/solar-solution/${id}`,
          {
            withCredentials: true, // Include credentials in the request
          }
        );
        const data = response.data.solution;
        setSolutionName(data.solutionName);
        setSolarPanelType(data.solarPanelType);
        setPowerOutput(data.powerOutput);
        setEfficiency(data.efficiency);
        setWarranty(data.warranty);
        setPrice(data.price);
        setCurrentPicUrl(data.solutionPic); // Set the current picture URL
      } catch (error) {
        console.error("Error fetching solution data", error);
        setError("Failed to fetch solar solution data.");
      }
    };

    fetchSolution();
  }, [id]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        alert("File size exceeds the 5MB limit. Please choose a smaller file.");
        e.target.value = ""; // Clear the input
        return;
      }
      setSolutionPic(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const formData = new FormData();
    formData.append("solutionName", solutionName);
    formData.append("solarPanelType", solarPanelType);
    formData.append("powerOutput", powerOutput);
    formData.append("efficiency", efficiency);
    formData.append("warranty", warranty);
    formData.append("price", price);
    if (solutionPic) formData.append("solutionPic", solutionPic);

    try {
      await axios.put(
        `http://localhost:5000/api/company/update-solar-solution/${id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true, // Include credentials in the request
        }
      );
      setSuccess("Solar solution updated successfully!");
      toast({
        title: "Success",
        description: "Solar solution updated successfully.",
      });
    } catch (error) {
      console.error("Error updating solution", error);
      setError("Failed to update solar solution. Please try again.");
    }
  };

  return (
    <>
      <div className="p-6">
        <Toaster /> {/* Add Toaster component */}
        <Link
          to="/company-dashboard/company-profile"
          className="inline-flex items-center text-primary hover:text-black dark:hover:text-white mb-8"
        >
          <ArrowLeftCircle className="mr-2" size={16} />
          Back to profile
        </Link>
        <div className="flex justify-center items-center">
          <Card className="shadow-lg rounded-lg overflow-hidden">
            <CardHeader className="p-4">
              <CardTitle className="text-2xl font-semibold">
                Update Solar Solution
              </CardTitle>
            </CardHeader>
            <Separator />
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6 mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="solutionName">Solution Name</Label>
                    <Input
                      id="solutionName"
                      value={solutionName}
                      onChange={(e) => setSolutionName(e.target.value)}
                      placeholder="Enter the solution name"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="solarPanelType">Solar Panel Type</Label>
                    <Input
                      id="solarPanelType"
                      value={solarPanelType}
                      onChange={(e) => setSolarPanelType(e.target.value)}
                      placeholder="Enter the solar panel type"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="powerOutput">Power Output (W)</Label>
                    <Input
                      id="powerOutput"
                      type="number"
                      value={powerOutput}
                      onChange={(e) => setPowerOutput(e.target.value)}
                      placeholder="Enter power output"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="efficiency">Efficiency (%)</Label>
                    <Input
                      id="efficiency"
                      type="number"
                      step="0.01"
                      value={efficiency}
                      onChange={(e) => setEfficiency(e.target.value)}
                      placeholder="Enter efficiency"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="warranty">Warranty (years)</Label>
                    <Input
                      id="warranty"
                      type="number"
                      value={warranty}
                      onChange={(e) => setWarranty(e.target.value)}
                      placeholder="Enter warranty period"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="price">Price (RM)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="Enter price"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="solutionPic">Solution Picture</Label>
                    {currentPicUrl && (
                      <div className="mb-4 border">
                        <img
                          src={`${BASE_URL}/${currentPicUrl}`}
                          alt="Solution"
                          className="w-full max-h-60 object-contain"
                        />
                      </div>
                    )}
                    <Input
                      id="solutionPic"
                      type="file"
                      onChange={handleFileChange}
                      accept="image/*"
                    />
                  </div>
                </div>
                {/* Feedback Messages */}
                {error && (
                  <div className="flex items-center space-x-2 border border-red-500 bg-red-100 p-2 rounded-md mt-2">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                {success && (
                  <div className="flex items-center space-x-2 border border-green-500 bg-green-100 text-green-700 p-2 rounded-md mt-2">
                    <AlertCircle className="h-5 w-5 text-green-500" />
                    <p className="text-sm text-green-700">{success}</p>
                  </div>
                )}

                <Button type="submit" className="w-full">
                  Update Solar Solution
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default UpdateSolutionForm;