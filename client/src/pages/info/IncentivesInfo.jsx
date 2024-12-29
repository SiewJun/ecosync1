import { useState, useEffect } from "react";
import {
  Search,
  CalendarDays,
  MapPin,
  Loader2,
  ExternalLink,
  Filter,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import NavBar from "@/_components/nav/NavBar";

const IncentivesDashboard = () => {
  const [incentives, setIncentives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  // Fetch incentives
  useEffect(() => {
    const fetchIncentives = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/admin-moderation/public/incentives",
          {
            credentials: "include", // Include credentials in the request
          }
        );
        if (!response.ok) throw new Error("Failed to fetch incentives");
        const data = await response.json();
        setIncentives(data.incentives);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchIncentives();
  }, []);

  // Get unique regions for filter
  const regions = [
    "all",
    ...new Set(incentives.map((inc) => inc.region.trim())),
  ];

  // Filter and search logic
  const filteredIncentives = incentives.filter((incentive) => {
    const matchesSearch =
      incentive.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incentive.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRegion =
      selectedRegion === "all" || incentive.region.trim() === selectedRegion;
    return matchesSearch && matchesRegion;
  });

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const paginateIncentives = (items) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return items.slice(startIndex, endIndex);
  };

  const paginatedIncentives = paginateIncentives(filteredIncentives);

  const PaginationControls = () => {
    const totalPages = Math.ceil(filteredIncentives.length / itemsPerPage);

    return (
      <div className="flex justify-center gap-2 mt-6">
        <Button
          variant="outline"
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
        </div>
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
    );
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        <p>{error}</p>
        <Button className="mt-4" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <NavBar />
      <div className="container mx-auto my-8">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Discover Solar Incentives</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header and Controls */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          {/* Search and Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search incentives..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger className="w-full sm:w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by region" />
              </SelectTrigger>
              <SelectContent>
                {regions.map((region) => (
                  <SelectItem key={region} value={region}>
                    {region.charAt(0).toUpperCase() + region.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Count */}
        <div className="text-sm text-muted-foreground">
          Showing {filteredIncentives.length} of {incentives.length} incentives
        </div>

        {/* Incentives Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedIncentives.map((incentive) => (
            <Card key={incentive.id} className="flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start gap-4">
                  <CardTitle className="text-xl">{incentive.title}</CardTitle>
                  <Badge
                    variant={
                      incentive.status === "ACTIVE" ? "default" : "secondary"
                    }
                  >
                    {incentive.status}
                  </Badge>
                </div>
                <CardDescription className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {incentive.region}
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-1">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {incentive.description}
                </p>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant="outline" className="font-semibold">
                      {incentive.incentiveAmount}
                    </Badge>
                  </div>

                  {incentive.expirationDate && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CalendarDays className="h-4 w-4" />
                      Expires: {formatDate(incentive.expirationDate)}
                    </div>
                  )}
                </div>
              </CardContent>

              <CardFooter className="flex-col sm:flex-row gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="flex-1 w-full">
                      View Details
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>{incentive.title}</DialogTitle>
                      <DialogDescription>
                        Complete details about this incentive
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold mb-2">Description</h3>
                        <p className="text-sm text-muted-foreground">
                          {incentive.description}
                        </p>
                      </div>

                      <div>
                        <h3 className="font-semibold mb-2">
                          Eligibility Criteria
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {incentive.eligibilityCriteria}
                        </p>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          Source: {incentive.source}
                        </div>
                        {incentive.expirationDate && (
                          <div className="text-sm text-muted-foreground">
                            Expires: {formatDate(incentive.expirationDate)}
                          </div>
                        )}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                {incentive.applicationLink && (
                  <Button className="flex-1 w-full" asChild>
                    <a
                      href={incentive.applicationLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Apply Now <ExternalLink />
                    </a>
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredIncentives.length === 0 && (
          <Card className="p-6 text-center">
            <CardHeader>
              <CardTitle>No Incentives Found</CardTitle>
              <CardDescription>
                Try adjusting your search terms or filters to find more results.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
        <PaginationControls />
      </div>
    </div>
  );
};

export default IncentivesDashboard;
