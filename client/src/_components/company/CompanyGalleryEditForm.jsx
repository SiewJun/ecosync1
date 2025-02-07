import { useState, useEffect } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AlertCircle, ArrowLeftCircle, Asterisk, Trash } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast"; // Import useToast
import { Toaster } from "@/components/ui/toaster"; // Import Toaster

const CompanyGalleryEditForm = () => {
  const [images, setImages] = useState([]); // State for selected images
  const [existingImages, setExistingImages] = useState([]); // State for existing images
  const [error, setError] = useState(null); // Error state
  const [success, setSuccess] = useState(null); // Success state
  const { toast } = useToast(); // Use the toast hook

  useEffect(() => {
    const fetchGalleryImages = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/company/company-profile",
          {
            withCredentials: true, // Include credentials in the request
          }
        );
        setExistingImages(response.data.CompanyGalleries);
      } catch (error) {
        console.error("Error fetching gallery images", error);
      }
    };

    fetchGalleryImages();
  }, []);

  // Handle image selection
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const validImageTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/bmp",
      "image/webp",
    ];
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

    const invalidTypeFiles = selectedFiles.filter(
      (file) => !validImageTypes.includes(file.type)
    );

    const oversizedFiles = selectedFiles.filter(
      (file) => file.size > MAX_FILE_SIZE
    );

    if (invalidTypeFiles.length > 0) {
      setError("Only image files are allowed.");
      setImages([]);
      return;
    }

    if (oversizedFiles.length > 0) {
      setError("File size exceeds the 5MB limit. Please choose a smaller file.");
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
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true, // Include credentials in the request
        }
      );
      setSuccess("Gallery updated successfully!");
      toast({
        title: "Success",
        description: "Gallery updated successfully.",
      });
    } catch (error) {
      console.error("Error updating gallery", error);
      setError("Failed to update gallery. Please try again.");
    }
  };

  // Handle image deletion
  const handleDeleteImage = async (id) => {
    try {
      await axios.delete(
        `http://localhost:5000/api/company/company-gallery/${id}`,
        {
          withCredentials: true, // Include credentials in the request
        }
      );
      setExistingImages(existingImages.filter((image) => image.id !== id));
      setSuccess("Image deleted successfully!");
      toast({
        title: "Success",
        description: "Image deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting image", error);
      setError("Failed to delete image. Please try again.");
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
          <Card className="shadow-lg rounded-lg overflow-hidden w-full max-w-3xl">
            <CardHeader className="p-4">
              <CardTitle className="text-xl font-bold">
                Edit Company Gallery
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Display existing images */}
                <div className="grid grid-cols-2 gap-4">
                  {existingImages.map((image) => (
                    <div key={image.id} className="relative">
                      <img
                        src={`http://localhost:5000/${image.imageUrl}`}
                        alt={`Gallery Image ${image.id}`}
                        className="rounded-md w-full h-32 object-contain border"
                      />
                      <button
                        type="button"
                        onClick={() => handleDeleteImage(image.id)}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"
                      >
                        <Trash className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div>
                  <label
                    htmlFor="gallery"
                    className="block text-sm font-medium"
                  >
                    Upload New Images
                  </label>
                  <Input
                    id="gallery"
                    type="file"
                    name="gallery"
                    onChange={handleFileChange}
                    multiple // Allow multiple files
                    accept="image/*" // Only accept image files
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring focus:ring-gray-500 focus:ring-opacity-50"
                  />
                  <div className="flex mt-2 items-center">
                    <p className="flex items-center text-sm text-slate-400">
                      <Asterisk className="w-3 h-3" />
                      Upload up to 5 images at a time
                    </p>
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={!!error || images.length === 0 || images.length > 5}
                >
                  Save Changes
                </Button>

                {/* Feedback Messages */}
                {error && (
                  <div className="flex items-center space-x-2 border border-red-500 bg-red-100 text-red-700 p-2 rounded-md mt-2">
                    <AlertCircle className="h-5 w-5" />
                    <p className="text-sm">{error}</p>
                  </div>
                )}
                {success && (
                  <div className="flex items-center space-x-2 border border-green-500 bg-green-100 text-green-700 p-2 rounded-md mt-2">
                    <AlertCircle className="h-5 w-5" />
                    <p className="text-sm">{success}</p>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default CompanyGalleryEditForm;