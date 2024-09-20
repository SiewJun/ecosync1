import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { AlertCircle, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { loadGoogleMaps } from "../../utils/googleMaps";

const ConsumerEditProfile = () => {
  const [user, setUser] = useState(null);
  const [consumerProfile, setConsumerProfile] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phoneNumber: "",
    address: "",
  });
  const [avatar, setAvatar] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const BASE_URL = "http://localhost:5000/";
  const addressInputRef = useRef(null);

  useEffect(() => {
    // Fetch current user and consumer profile details to populate form
    const fetchDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:5000/api/consumer/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data.user);
        setConsumerProfile(response.data.consumerProfile);
        setFormData({
          username: response.data.user.username,
          email: response.data.user.email,
          phoneNumber: response.data.consumerProfile?.phoneNumber || "",
          address: response.data.consumerProfile?.address || "",
        });
      } catch (error) {
        console.error("Error fetching details:", error);
      }
    };
    fetchDetails();
  }, []);

  useEffect(() => {
    loadGoogleMaps(() => {
      if (addressInputRef.current) {
        const autocomplete = new window.google.maps.places.Autocomplete(addressInputRef.current, {
          types: ["address"],
        });

        autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace();
          if (place.formatted_address) {
            setFormData((prevData) => ({
              ...prevData,
              address: place.formatted_address,
            }));
          }
        });
      }
    });
  }, []);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const handleFileChange = (e) => {
    setAvatar(e.target.files[0]);
  };

  const handleSubmit = async () => {
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const formDataObj = new FormData();
      formDataObj.append("username", formData.username);
      formDataObj.append("email", formData.email);
      formDataObj.append("phoneNumber", formData.phoneNumber);
      formDataObj.append("address", formData.address);

      // Add avatar if selected
      if (avatar) {
        formDataObj.append("avatar", avatar);
      }

      await axios.put("http://localhost:5000/api/consumer/profile", formDataObj, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccess("Profile updated successfully!");
      navigate("/consumer-dashboard/consumer-profile");
    } catch (error) {
      setError("Error updating profile: " + error.response?.data?.message || error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="flex items-center mb-4">
        <ChevronLeft className="cursor-pointer" onClick={() => navigate(-1)} />
        <span className="ml-2 text-xl font-bold">Back</span>
      </div>
      <div className="max-w-5xl container mx-auto p-6 space-y-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-bold">
              <span>Edit Profile</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {user && consumerProfile !== null ? (
              <div className="space-y-4">
                {/* Avatar Upload */}
                <div className="space-y-2">
                  <Label htmlFor="avatar">Avatar</Label>
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={`${BASE_URL}${user.avatarUrl}`} alt="User Avatar" />
                      <AvatarFallback>{user.username[0]}</AvatarFallback>
                    </Avatar>
                    <Input id="avatar" type="file" onChange={handleFileChange} />
                  </div>
                </div>

                {/* User Details */}
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" value={formData.username} onChange={handleChange} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={formData.email} onChange={handleChange} />
                </div>

                {/* Consumer Profile Details */}
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input id="phoneNumber" value={formData.phoneNumber} onChange={handleChange} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" value={formData.address} onChange={handleChange} ref={addressInputRef} />
                </div>

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

                <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full">
                  {isSubmitting ? "Updating..." : "Update Profile"}
                </Button>
              </div>
            ) : (
              <div>Could not fetch data</div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default ConsumerEditProfile;