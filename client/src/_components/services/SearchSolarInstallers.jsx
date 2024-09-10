import { useEffect, useState } from "react";
import axios from "axios";
import SolarInstallers from "./SolarInstallers";
import { Loader, AlertCircle, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import NavBar from "../nav/NavBar";

const SearchSolarInstallers = () => {
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchCompanyDetails = async () => {
      try {
        setProgress(25);
        const response = await axios.get("http://localhost:5000/api/company-services/company-details");
        setProgress(75);
        setCompanies(response.data);
        setFilteredCompanies(response.data);
        setLoading(false);
        setProgress(100);
      } catch (err) {
        setError("Error fetching company details", err);
        setLoading(false);
        setProgress(100);
      }
    };

    fetchCompanyDetails();
  }, []);

  useEffect(() => {
    const results = companies.filter(company =>
      company.CompanyDetail.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.CompanyProfile.overview.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCompanies(results);
    setCurrentPage(1);
  }, [searchTerm, companies]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const pageCount = Math.ceil(filteredCompanies.length / itemsPerPage);
  const paginatedCompanies = filteredCompanies.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-6 bg-gray-50">
        <Loader className="animate-spin h-16 w-16 text-blue-500" />
        <Progress value={progress} className="w-64" />
        <p className="text-gray-600 text-lg">Loading solar installers...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
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
      <div className="max-w-5xl mx-auto px-2 sm:px-4 py-4 sm:py-6">
        <div className="mb-4 space-y-3">
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2">
            <Input
              type="text"
              placeholder="Search companies..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full sm:w-auto text-sm py-1"
            />
            <Button variant="outline" size="sm" className="w-full sm:w-auto px-3">
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