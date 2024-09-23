import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AlertCircle, ChevronLeft } from "lucide-react";
import axios from "axios";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useNavigate, useParams } from "react-router-dom";

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
  const navigate = useNavigate();
  const BASE_URL = "http://localhost:5000";

  useEffect(() => {
    // Fetch the existing data for the solution
    const fetchSolution = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:5000/api/company/solar-solution/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
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
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/company/update-solar-solution/${id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setSuccess("Solar solution updated successfully!");
      navigate(`/company-dashboard/company-profile`);
    } catch (error) {
      console.error("Error updating solution", error);
      setError("Failed to update solar solution. Please try again.");
    }
  };

  return (
    <>
      <div className="flex items-center mb-4">
        <ChevronLeft className="cursor-pointer" onClick={() => navigate(-1)} />
        <span className="ml-2 text-xl font-bold">Back</span>{" "}
      </div>
      <div className="max-w-5xl container mx-auto p-6 space-y-8">
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
                    onChange={(e) => setSolutionPic(e.target.files[0])}
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
    </>
  );
};

export default UpdateSolutionForm;
