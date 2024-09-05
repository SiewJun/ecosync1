import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const CompanyDetail = () => {
  const [user, setUser] = useState(null);
  const [company, setCompany] = useState(null);
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchCompanyDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/company/company-details', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data.user);
        setCompany(response.data.user.CompanyDetail);
      } catch (error) {
        console.error('Error fetching company details:', error);
      }
    };

    fetchCompanyDetails();
  }, []);

  const handlePasswordUpdate = async () => {
    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match!");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/auth/change-password', {
        currentPassword: password,
        newPassword,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage("Password updated successfully!");
    } catch (error) {
      setMessage('Error updating password: ' + error.response.data.message);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      {user && company ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* User Information Card */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-card-foreground">User Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div><strong>Username:</strong> {user.username}</div>
              <div><strong>Email:</strong> {user.email}</div>
              <div><strong>Avatar URL:</strong> {user.avatarUrl || 'N/A'}</div>
            </CardContent>
          </Card>

          {/* Company Information Card */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-card-foreground">Company Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div><strong>Company Name:</strong> {company.companyName}</div>
              <div><strong>Phone Number:</strong> {company.phoneNumber}</div>
              <div><strong>Address:</strong> {company.address}</div>
              <div><strong>Website:</strong> <a href={company.website} className="text-blue-500 hover:underline">{company.website}</a></div>
              <div><strong>Registration Number:</strong> {company.registrationNumber}</div>
              <div><strong>Business License:</strong> {company.businessLicense}</div>
              <div><strong>Created At:</strong> {new Date(company.createdAt).toLocaleDateString()}</div>
            </CardContent>
          </Card>

          {/* Password Update Section */}
          <Card className="col-span-1 md:col-span-2 shadow-lg hover:shadow-xl transition-shadow duration-200">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-card-foreground">Change Password</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter current password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                />
              </div>
              <Button className="w-full mt-4" onClick={handlePasswordUpdate}>Update Password</Button>
              {message && <p className={`text-sm ${message.includes("successfully") ? "text-green-500" : "text-red-500"}`}>{message}</p>}
            </CardContent>
          </Card>
        </div>
      ) : (
        <p className="text-center text-gray-500">Loading...</p>
      )}
    </div>
  );
};

export default CompanyDetail;
