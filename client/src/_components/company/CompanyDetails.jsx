import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Eye, EyeOff, AlertCircle, X, Loader2 } from "lucide-react";

const CompanyDetail = () => {
  const [user, setUser] = useState(null);
  const [company, setCompany] = useState(null);
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
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showChangePasswordForm, setShowChangePasswordForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const BASE_URL = "http://localhost:5000/";

  useEffect(() => {
    const fetchCompanyDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:5000/api/company/company-details",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const userData = response.data.user;
        userData.avatarUrl = `${BASE_URL}${userData.avatarUrl}`;
        setUser(userData);
        setCompany(userData.CompanyDetail);
      } catch (error) {
        console.error("Error fetching company details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanyDetails();
  }, []);

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
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : user && company ? (
        <div className="space-y-8">
          {/* User Information Card */}
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
                  <AvatarFallback>{company.companyName[0]}</AvatarFallback>
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
              <Link to="/company-dashboard/company-details/company-edit-details">
                <Button className="mt-32 w-full" variant="secondary">
                  Update Information
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Company Information Card */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-card-foreground">
                Company Details
              </CardTitle>
            </CardHeader>
            <Separator />

            <CardContent className="space-y-3 mt-5">
              <div>
                <strong>Company Name:</strong> {company.companyName}
              </div>
              <div>
                <strong>Phone Number:</strong> {company.phoneNumber}
              </div>
              <div>
                <strong>Address:</strong> {company.address}
              </div>
              <div>
                <strong>Website:</strong>{" "}
                <a
                  href={
                    company.website.startsWith("http://") ||
                    company.website.startsWith("https://")
                      ? company.website
                      : `https://${company.website}`
                  }
                  className="text-blue-500 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {company.website}
                </a>
              </div>
              <div>
                <strong>Registration Number:</strong>{" "}
                {company.registrationNumber}
              </div>

              {/* Business License Document */}
              <div>
                <strong>Business License:</strong>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="link"
                      className="text-blue-500 hover:underline"
                    >
                      View Business License
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogTitle>Business License</DialogTitle>
                    <object
                      data={company.businessLicense}
                      type="application/pdf"
                      width="100%"
                      height="500px"
                    >
                      <p>
                        Your browser does not support this document.{" "}
                        <a
                          href={company.businessLicense}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button variant="link">Download the PDF</Button>
                        </a>
                      </p>
                    </object>
                  </DialogContent>
                </Dialog>
              </div>

              <div>
                <strong>Joined On:</strong>{" "}
                {new Date(company.createdAt).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>

          {/* Change Password Button */}
          <div className="col-span-1 md:col-span-2">
            <Button
              variant="outline"
              className="mx-auto"
              onClick={() => setShowChangePasswordForm(!showChangePasswordForm)}
            >
              {showChangePasswordForm ? <X /> : "Change Password"}
            </Button>
          </div>

          {/* Password Update Section */}
          {showChangePasswordForm && (
            <Card className="col-span-1 md:col-span-2 shadow-md">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-card-foreground">
                  Change Password
                </CardTitle>
              </CardHeader>
              <Separator />

              <CardContent className="space-y-4">
                {/* Current Password */}
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

                {/* New Password */}
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

                {/* Confirm New Password */}
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

                {/* Error and Success Messages */}
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

                {/* Update Password Button */}
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
        <div>Could not fetch data</div>
      )}
    </div>
  );
};

export default CompanyDetail;