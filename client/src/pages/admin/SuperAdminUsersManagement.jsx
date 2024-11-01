import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MoreVertical,
  Trash2,
  UserPlus,
  UserMinus,
  Eye,
  EyeOff,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";

const SuperAdminUsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [confirmationInput, setConfirmationInput] = useState("");
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isCreateAdminOpen, setIsCreateAdminOpen] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const usersPerPage = 10;

  const [createAdminForm, setCreateAdminForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [createAdminError, setCreateAdminError] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/superadmin-moderation/users",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        const data = await response.json();
        setUsers(data.users);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    let result = users;

    if (roleFilter !== "ALL") {
      result = result.filter((user) => user.role === roleFilter);
    }

    if (searchTerm) {
      result = result.filter(
        (user) =>
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.username.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredUsers(result);
    setCurrentPage(1);
  }, [users, roleFilter, searchTerm]);

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setCreateAdminError("");

    if (createAdminForm.password !== createAdminForm.confirmPassword) {
      setCreateAdminError("Passwords do not match");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/superadmin-moderation/create-admin",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            username: createAdminForm.username,
            email: createAdminForm.email,
            password: createAdminForm.password,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setUsers((prev) => [...prev, { ...data.admin, role: "ADMIN" }]);
        setCreateAdminForm({
          username: "",
          email: "",
          password: "",
          confirmPassword: "",
        });
        setIsCreateAdminOpen(false);
      } else {
        setCreateAdminError(data.message || "Failed to create admin");
      }
    } catch (error) {
      console.error("Error creating admin:", error);
      setCreateAdminError("An unexpected error occurred");
    }
  };

  const renderRoleBadge = (role) => {
    const badgeVariants = {
      SUPERADMIN: "destructive",
      ADMIN: "secondary",
      COMPANY: "outline",
      CONSUMER: "default",
    };

    return <Badge variant={badgeVariants[role] || "default"}>{role}</Badge>;
  };

  const resetConfirmationDialog = () => {
    setSelectedUser(null);
    setConfirmationInput("");
    setActionType(null);
    setIsConfirmDialogOpen(false);
    setDropdownOpen(false);
  };

  const handleActionConfirmation = (user, type) => {
    setSelectedUser(user);
    setActionType(type);
    setConfirmationInput("");
    setIsConfirmDialogOpen(true);
    setDropdownOpen(false);
  };

  const handleConfirmAction = async () => {
    if (!selectedUser) return;

    const expectedConfirmation = `${selectedUser.username} ${selectedUser.email}`;
    if (confirmationInput !== expectedConfirmation) {
      return;
    }

    try {
      if (actionType === "demote") {
        await handleDemoteAdmin(selectedUser.id);
      } else if (actionType === "delete") {
        await handleDeleteUser(selectedUser.id);
      }
      resetConfirmationDialog();
    } catch (error) {
      console.error(`Error ${actionType}ing user:`, error);
    }
  };

  const handleDemoteAdmin = async (userId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/superadmin-moderation/demote-admin/${userId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.ok) {
        const updatedUsers = users.map((user) =>
          user.id === userId ? { ...user, role: "CONSUMER" } : user
        );
        setUsers(updatedUsers);
      }
    } catch (error) {
      console.error("Error demoting admin:", error);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/superadmin-moderation/delete-user/${userId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.ok) {
        const updatedUsers = users.filter((user) => user.id !== userId);
        setUsers(updatedUsers);
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>User Management</CardTitle>
          <Dialog open={isCreateAdminOpen} onOpenChange={setIsCreateAdminOpen}>
            <DialogTrigger asChild>
              <Button variant="default">
                <UserPlus className="mr-2 h-4 w-4" /> Create Admin
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Admin</DialogTitle>
                <DialogDescription>
                  Create a new admin account for the system.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateAdmin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={createAdminForm.username}
                    onChange={(e) =>
                      setCreateAdminForm((prev) => ({
                        ...prev,
                        username: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={createAdminForm.email}
                    onChange={(e) =>
                      setCreateAdminForm((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={createAdminForm.password}
                      onChange={(e) =>
                        setCreateAdminForm((prev) => ({
                          ...prev,
                          password: e.target.value,
                        }))
                      }
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={createAdminForm.confirmPassword}
                      onChange={(e) =>
                        setCreateAdminForm((prev) => ({
                          ...prev,
                          confirmPassword: e.target.value,
                        }))
                      }
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                {createAdminError && (
                  <p className="text-red-500 text-sm">{createAdminError}</p>
                )}
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateAdminOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Create Admin</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <div className="flex justify-between items-center space-x-4 mt-4">
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-1/3"
          />
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Roles</SelectItem>
              <SelectItem value="CONSUMER">Consumer</SelectItem>
              <SelectItem value="COMPANY">Company</SelectItem>
              <SelectItem value="ADMIN">Admin</SelectItem>
              <SelectItem value="SUPERADMIN">Super Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Username</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{renderRoleBadge(user.role)}</TableCell>
                <TableCell>
                  {user.role !== "SUPERADMIN" && (
                    <DropdownMenu
                      open={dropdownOpen && selectedUser?.id === user.id}
                      onOpenChange={(open) => {
                        setDropdownOpen(open);
                        if (open) setSelectedUser(user);
                      }}
                    >
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {user.role === "ADMIN" && (
                          <DropdownMenuItem
                            onSelect={(e) => {
                              e.preventDefault();
                              handleActionConfirmation(user, "demote");
                            }}
                          >
                            <UserMinus className="mr-2 h-4 w-4" />
                            Demote Admin
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onSelect={(e) => {
                            e.preventDefault();
                            handleActionConfirmation(user, "delete");
                          }}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Dialog
          open={isConfirmDialogOpen}
          onOpenChange={(open) => {
            if (!open) {
              resetConfirmationDialog();
            }
          }}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                Confirm{" "}
                {actionType === "demote" ? "Admin Demotion" : "User Deletion"}
              </DialogTitle>
              <DialogDescription>
                This action cannot be undone. To confirm, please type{" "}
                <span className="font-bold">
                  {selectedUser?.username} {selectedUser?.email}
                </span>
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                value={confirmationInput}
                onChange={(e) => setConfirmationInput(e.target.value)}
                placeholder="Type to confirm"
              />
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetConfirmationDialog}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant={actionType === "delete" ? "destructive" : "default"}
                  onClick={handleConfirmAction}
                  disabled={
                    confirmationInput !==
                    `${selectedUser?.username} ${selectedUser?.email}`
                  }
                >
                  {actionType === "demote" ? "Demote Admin" : "Delete User"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <div className="flex justify-between items-center mt-4">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SuperAdminUsersManagement;
