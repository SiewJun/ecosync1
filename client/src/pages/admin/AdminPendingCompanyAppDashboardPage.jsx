import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import ApplicationTable from "./ApplicationTable"; // Adjust the import path as needed

const AdminPendingCompanyAppDashboard = () => {
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState("");
  const [pendingColumnFilters, setPendingColumnFilters] = useState([]);
  const [approvedColumnFilters, setApprovedColumnFilters] = useState([]);
  const [rejectedColumnFilters, setRejectedColumnFilters] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleResendEmail = async (id) => {
    try {
      const response = await axios.post(
        `http://localhost:5000/api/auth/resend-approval-email/${id}`,
        {},
        {
          withCredentials: true, // Include credentials in the request
        }
      );
      toast({
        title: "Success",
        description: response.data.message,
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to resend approval email",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/auth/all-applications",
          {
            withCredentials: true, // Include credentials in the request
          }
        );
        setApplications(response.data.applications);
      } catch (error) {
        if (error.response && error.response.status === 403) {
          // Token expired or invalid, redirect to sign-in page
          navigate("/signin");
        } else {
          setError(error.response.data.message || "An error occurred");
        }
      }
    };

    fetchApplications();
  }, [navigate]);

  const columns = [
    {
      accessorKey: "companyName",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="p-0"
        >
          Company Name
        </Button>
      ),
      cell: ({ row }) => row.getValue("companyName"),
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <div className="lowercase">{row.getValue("email")}</div>
      ),
    },
    {
      accessorKey: "phoneNumber",
      header: "Phone Number",
      cell: ({ row }) => row.getValue("phoneNumber"),
    },
    {
      accessorKey: "address",
      header: "Address",
      cell: ({ row }) => row.getValue("address"),
    },
    {
      accessorKey: "website",
      header: "Website",
      cell: ({ row }) => (
        <a
          href={row.getValue("website")}
          target="_blank"
          rel="noopener noreferrer"
        >
          {row.getValue("website")}
        </a>
      ),
    },
    {
      accessorKey: "registrationNumber",
      header: "Registration Number",
      cell: ({ row }) => row.getValue("registrationNumber"),
    },
    {
      accessorKey: "businessLicense",
      header: "Business License",
      cell: ({ row }) => (
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="link"
              onClick={() =>
                setSelectedDocument(row.getValue("businessLicense"))
              }
            >
              View Document
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Business License</DialogTitle>
            <DialogDescription>
              <object
                data={selectedDocument}
                type="application/pdf"
                width="100%"
                height="500px"
              >
                <p>
                  Your browser does not support this document.{" "}
                  <a
                    href={selectedDocument}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="link" className="p-0">
                      Download the PDF
                    </Button>
                  </a>{" "}
                </p>
              </object>
            </DialogDescription>
          </DialogContent>
        </Dialog>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("status")}</div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      enableHiding: false,
      cell: ({ row }) => {
        const app = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {app.status === "Pending" ? (
                <>
                  <DropdownMenuItem
                    onClick={() => handleReview(app.id, "Approved")}
                  >
                    Approve
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleReview(app.id, "Rejected")}
                    className="text-red-500"
                  >
                    Reject
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem onClick={() => handleResendEmail(app.id)}>
                  Resend Approval Email
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const handleReview = async (id, status) => {
    try {
      await axios.post(
        `http://localhost:5000/api/auth/review-application/${id}`,
        { status },
        {
          withCredentials: true, // Include credentials in the request
        }
      );
      // Refresh the application list
      window.location.reload();
    } catch (error) {
      console.error("Error reviewing application:", error);
    }
  };

  const pendingApplications = applications.filter(
    (app) => app.status === "Pending"
  );
  const approvedApplications = applications.filter(
    (app) => app.status === "Approved"
  );
  const rejectedApplications = applications.filter(
    (app) => app.status === "Rejected"
  );

  return (
    <>
      <Toaster />
      <div className="container p-6 space-y-8">
        <div>
          <h1 className="text-3xl font-bold font-inter">
            Company Applications
          </h1>
          <p className="mt-2 text-gray-500">
            Manage and track your organization&apos;s company applications
          </p>
        </div>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <div>
          <ApplicationTable
            data={pendingApplications}
            columns={columns}
            title="Pending Applications"
            columnFilters={pendingColumnFilters}
            setColumnFilters={setPendingColumnFilters}
          />
          <ApplicationTable
            data={approvedApplications}
            columns={columns}
            title="Approved Applications"
            columnFilters={approvedColumnFilters}
            setColumnFilters={setApprovedColumnFilters}
          />
          <ApplicationTable
            data={rejectedApplications}
            columns={columns}
            title="Rejected Applications"
            columnFilters={rejectedColumnFilters}
            setColumnFilters={setRejectedColumnFilters}
          />
        </div>
      </div>
    </>
  );
};

export default AdminPendingCompanyAppDashboard;
