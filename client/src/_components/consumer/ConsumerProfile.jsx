import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { AlertCircle, Eye, EyeOff, X } from "lucide-react";
import { Link } from "react-router-dom";

const ConsumerProfile = () => {
  const [user, setUser] = useState(null);
  const [consumerProfile, setConsumerProfile] = useState(null);
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStarted, setPasswordStarted] = useState(false);
  const [passwordConditions, setPasswordConditions] = useState({
    length: false,
    upperCase: false,
    lowerCase: false,
    number: false,
    specialChar: false,
  });
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showChangePasswordForm, setShowChangePasswordForm] = useState(false);

  const BASE_URL = "http://localhost:5000/";

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:5000/api/consumer/profile",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const userData = response.data.user;
        userData.avatarUrl = `${BASE_URL}${userData.avatarUrl}`;
        setUser(userData);
        setConsumerProfile(response.data.consumerProfile);
      } catch (error) {
        console.error("Error fetching consumer profile:", error);
        setError("Error fetching consumer profile. Please try again later.");
      }
    };

    fetchUserProfile();
  }, []);

  const handleCreateProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:5000/api/consumer/profile",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setConsumerProfile(response.data.profile);
    } catch (error) {
      console.error("Error creating consumer profile:", error);
      setError("Error creating consumer profile. Please try again later.");
    }
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    if (id === "new-password") {
      setNewPassword(value);
      setPasswordStarted(true);
      setPasswordConditions({
        length: value.length >= 6,
        upperCase: /[A-Z]/.test(value),
        lowerCase: /[a-z]/.test(value),
        number: /[0-9]/.test(value),
        specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(value),
      });
    } else if (id === "confirm-password") {
      setConfirmPassword(value);
    }
  };

  const handlePasswordUpdate = async () => {
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    if (
      !passwordConditions.length ||
      !passwordConditions.upperCase ||
      !passwordConditions.lowerCase ||
      !passwordConditions.number ||
      !passwordConditions.specialChar
    ) {
      setError("Password must meet the required conditions.");
      setIsSubmitting(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match!");
      setIsSubmitting(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/api/auth/change-password",
        {
          currentPassword: password,
          newPassword,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSuccess("Password updated successfully!");
    } catch (error) {
      setError("Error updating password: " + error.response.data.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl container mx-auto p-6 space-y-8">
      {error && (
        <div className="flex items-center space-x-2 border border-red-500 bg-red-100 text-red-700 p-2 rounded-md">
          <AlertCircle className="h-5 w-5" />
          <p>{error}</p>
        </div>
      )}

      {user ? (
        <div className="space-y-8">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-card-foreground">
                User Information
              </CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="space-y-4 mt-5">
              <div className="flex items-center space-x-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={user.avatarUrl} alt="User Avatar" />
                  <AvatarFallback>{user.username[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <div>
                    <strong>Username:</strong> {user.username}
                  </div>
                  <div>
                    <strong>Email:</strong> {user.email}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {!consumerProfile ? (
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-card-foreground">
                  Consumer Profile
                </CardTitle>
              </CardHeader>
              <Separator />
              <CardContent className="space-y-4 mt-5">
                <p>No consumer profile found for this user.</p>
                <Button
                  className="w-full"
                  variant="link"
                  onClick={handleCreateProfile}
                >
                  Create a Consumer Profile Now
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-card-foreground">
                  Consumer Profile Details
                </CardTitle>
              </CardHeader>
              <Separator />
              <CardContent className="space-y-4 mt-5">
                <div>
                  <strong>Phone Number:</strong> {consumerProfile.phoneNumber}
                </div>
                <div>
                  <strong>Address:</strong> {consumerProfile.address}
                </div>
                <Link to="/consumer-dashboard/consumer-profile/consumer-edit-profile">
                  <Button className="mt-32 w-full" variant="secondary">
                    Update Information{" "}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          <div className="col-span-1 md:col-span-2">
            <Button
              variant="outline"
              className="mx-auto"
              onClick={() => setShowChangePasswordForm(!showChangePasswordForm)}
            >
              {showChangePasswordForm ? <X /> : "Change Password"}
            </Button>
          </div>

          {showChangePasswordForm && (
            <Card className="col-span-1 md:col-span-2 shadow-md">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-card-foreground">
                  Change Password
                </CardTitle>
              </CardHeader>
              <Separator />

              <CardContent className="space-y-4">
                <div className="space-y-2 mt-5">
                  <Label htmlFor="current-password">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="current-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5 text-gray-600" />
                      ) : (
                        <Eye className="w-5 h-5 text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={handleChange}
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center px-3"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <EyeOff className="w-5 h-5 text-gray-600" />
                      ) : (
                        <Eye className="w-5 h-5 text-gray-600" />
                      )}
                    </button>
                  </div>

                  {passwordStarted && (
                    <div className="text-sm text-gray-600 mt-2">
                      <ul className="list-disc list-inside">
                        <li
                          className={
                            passwordConditions.length
                              ? "text-green-500"
                              : "text-red-500"
                          }
                        >
                          At least 6 characters long
                        </li>
                        <li
                          className={
                            passwordConditions.upperCase
                              ? "text-green-500"
                              : "text-red-500"
                          }
                        >
                          Includes an uppercase letter
                        </li>
                        <li
                          className={
                            passwordConditions.lowerCase
                              ? "text-green-500"
                              : "text-red-500"
                          }
                        >
                          Includes a lowercase letter
                        </li>
                        <li
                          className={
                            passwordConditions.number
                              ? "text-green-500"
                              : "text-red-500"
                          }
                        >
                          Includes a number
                        </li>
                        <li
                          className={
                            passwordConditions.specialChar
                              ? "text-green-500"
                              : "text-red-500"
                          }
                        >
                          Includes a special character
                        </li>
                      </ul>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={handleChange}
                      placeholder="Re-enter new password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center px-3"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5 text-gray-600" />
                      ) : (
                        <Eye className="w-5 h-5 text-gray-600" />
                      )}
                    </button>
                  </div>
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

                <Button
                  onClick={handlePasswordUpdate}
                  disabled={isSubmitting}
                  className="w-full mt-4"
                >
                  {isSubmitting ? "Updating..." : "Update Password"}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default ConsumerProfile;
