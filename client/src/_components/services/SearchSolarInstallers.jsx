import { useEffect, useState } from "react";
import axios from "axios";
import SolarInstallers from "./SolarInstallers";
import { AlertCircle, Search, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import NavBar from "../nav/NavBar";

const SearchSolarInstallers = () => {
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [addressFilter, setAddressFilter] = useState(""); // New state for address filter
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchCompanyDetails = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/company-services/company-details",
          {
            withCredentials: true, // Include credentials in the request
          }
        );
        setCompanies(response.data);
        setFilteredCompanies(response.data);
        setLoading(false);
      } catch (err) {
        setError("Error fetching company details", err);
        setLoading(false);
      }
    };
  
    fetchCompanyDetails();
  }, []);

  useEffect(() => {
    const results = companies.filter((company) => {
      // Normalize strings for case-insensitive comparison and remove extra spaces
      const normalizedAddress = company.CompanyDetail.address
        .toLowerCase()
        .trim()
        .replace(/\s+/g, ' ');
      const normalizedAddressFilter = addressFilter
        .toLowerCase()
        .trim()
        .replace(/\s+/g, ' ');
      const normalizedSearch = searchTerm
        .toLowerCase()
        .trim()
        .replace(/\s+/g, ' ');

      // Check if company name or overview matches search term
      const matchesSearch = 
        company.CompanyDetail.companyName
          .toLowerCase()
          .includes(normalizedSearch) ||
        company.CompanyProfile.overview
          .toLowerCase()
          .includes(normalizedSearch);

      // Advanced address matching
      const matchesAddress = addressFilter === "" || (
        // Full address contains filter text
        normalizedAddress.includes(normalizedAddressFilter) ||
        // Match individual parts of the address
        normalizedAddress.split(/[,\s]+/).some(part =>
          normalizedAddressFilter.split(/[,\s]+/).some(filterPart =>
            part.includes(filterPart)
          )
        )
      );

      return matchesSearch && matchesAddress;
    });

    setFilteredCompanies(results);
    setCurrentPage(1);
  }, [searchTerm, addressFilter, companies]);

  const pageCount = Math.ceil(filteredCompanies.length / itemsPerPage);
  const paginatedCompanies = filteredCompanies.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle className="text-lg font-semibold">Error</AlertTitle>
          <AlertDescription className="text-base">{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, pageCount));
  };

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
              <BreadcrumbPage>Search Solar Installers</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="container mx-auto px-4 py-12">
        <div className="mb-4 space-y-3">
          <div className="sm:ml-10 flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2">
            <Input
              type="text"
              placeholder="Search companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-auto text-sm py-1"
            />
            <Input
              type="text"
              placeholder="Filter by address..."
              value={addressFilter}
              onChange={(e) => setAddressFilter(e.target.value)}
              className="w-full sm:w-auto text-sm py-1"
            />
            <Button
              variant="outline"
              size="sm"
              className="w-full sm:w-auto px-3"
            >
              <Search className="h-4 w-4 mr-1" />
              Search
            </Button>
          </div>
          <div className="flex justify-center items-center space-x-2">
            <Button
              variant="outline"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="px-2 py-1 text-xs"
            >
              <ChevronLeft className="h-3 w-3 mr-1" />
              Prev
            </Button>
            <span className="text-xs font-medium">
              Page {currentPage} of {pageCount}
            </span>
            <Button
              variant="outline"
              onClick={handleNextPage}
              disabled={currentPage === pageCount}
              className="px-2 py-1 text-xs"
            >
              Next
              <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </div>
        <SolarInstallers
          companies={paginatedCompanies}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          pageCount={pageCount}
        />
      </div>
    </div>
  );
};

export default SearchSolarInstallers;
