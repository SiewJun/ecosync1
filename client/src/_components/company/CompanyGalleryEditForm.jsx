import { useState } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AlertCircle, ChevronLeft, Asterisk } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CompanyGalleryEditForm = () => {
  const [images, setImages] = useState([]); // State for selected images
  const [error, setError] = useState(null); // Error state
  const [success, setSuccess] = useState(null); // Success state
  const navigate = useNavigate();

  // Handle image selection
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const validImageTypes = ["image/jpeg", "image/png", "image/gif"];
    const invalidFiles = selectedFiles.filter(
      (file) => !validImageTypes.includes(file.type)
    );

    if (invalidFiles.length > 0) {
      setError("Only image files (jpeg, png, gif) are allowed.");
      setImages([]);
      return;
    }

    if (selectedFiles.length > 5) {
      setError("You can only upload up to 5 images. Please select again.");
      setImages([]);
    } else {
      setError(null);
      setImages(selectedFiles);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (error) return; // Prevent submission if there's an error
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();

      // Append each selected image to formData
      images.forEach((image) => {
        formData.append("images", image);
      });

      await axios.put(
        "http://localhost:5000/api/company/update-gallery",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setSuccess("Gallery updated successfully!");
    } catch (error) {
      console.error("Error updating gallery", error);
      setError("Failed to update gallery. Please try again.");
    }
  };

  return (
    <>
      <div className="flex items-center mb-4">
        <ChevronLeft className="cursor-pointer" onClick={() => navigate(-1)} />
        <span className="ml-2 text-xl font-bold">Back</span>
      </div>
      <div className="max-w-5xl container mx-auto p-6 space-y-8">
        <Card className="shadow-lg rounded-lg overflow-hidden">
          <CardHeader className="p-4">
            <CardTitle className="text-xl font-bold">
              Edit Company Gallery
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="gallery" className="block text-sm font-medium">
                  Upload Images
                </label>
                <Input
                  id="gallery"
                  type="file"
                  name="gallery"
                  onChange={handleFileChange}
                  multiple // Allow multiple files
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring focus:ring-gray-500 focus:ring-opacity-50"
                />
                <div className="flex mt-2 items-center">
                  <p className="flex items-center text-sm text-slate-400">
                    <Asterisk className="w-3 h-3" />
                    Upload 5 images at a time
                  </p>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={!!error}>
                Save Changes
              </Button>

              {/* Feedback Messages */}
              {error && (
                <div className="flex items-center space-x-2 border border-red-500 bg-red-100 p-2 rounded-md mt-2">
                  <AlertCircle className="h-5 w-5" />
                  <p className="text-sm">{error}</p>
                </div>
              )}
              {success && (
                <div className="flex items-center space-x-2 border border-green-500 bg-green-100 p-2 rounded-md mt-2">
                  <AlertCircle className="h-5 w-5" />
                  <p className="text-sm">{success}</p>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default CompanyGalleryEditForm;