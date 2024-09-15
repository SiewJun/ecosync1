import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sun, Battery, Zap, Shield, DollarSign, Award, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import NavBar from "../nav/NavBar";

const BASE_URL = "http://localhost:5000/";

const SolarSolutionComparison = () => {
  const [solutions, setSolutions] = useState([]);
  const [selectedSolutions, setSelectedSolutions] = useState([]);
  const [filteredSolutions, setFilteredSolutions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [sortBy, setSortBy] = useState("companyName");
  const [filterBy, setFilterBy] = useState("all");
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    const fetchSolarSolutions = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}api/company-services/solar-solutions`
        );
        setSolutions(response.data);
        setFilteredSolutions(response.data);
        // Extract unique company names
        const uniqueCompanies = [...new Set(response.data.map(
          solution => solution.CompanyProfile.User.CompanyDetail.companyName
        ))];
        setCompanies(uniqueCompanies);
      } catch (error) {
        console.error("Error fetching solar solutions:", error);
      }
    };

    fetchSolarSolutions();
  }, []);

  useEffect(() => {
    const results = solutions.filter((solution) =>
      solution.solutionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      solution.CompanyProfile.User.CompanyDetail.companyName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    let filtered = filterBy === "all" 
      ? results 
      : results.filter(solution => 
          solution.CompanyProfile.User.CompanyDetail.companyName === filterBy
        );

    filtered.sort((a, b) => {
      if (sortBy === "price") return a.price - b.price;
      if (sortBy === "efficiency") return b.efficiency - a.efficiency;
      if (sortBy === "powerOutput") return b.powerOutput - a.powerOutput;
      if (sortBy === "companyName") return a.CompanyProfile.User.CompanyDetail.companyName.localeCompare(b.CompanyProfile.User.CompanyDetail.companyName);
      return 0;
    });

    setFilteredSolutions(filtered);
    setCurrentPage(1);
  }, [searchTerm, sortBy, filterBy, solutions]);

  const handleSolutionSelect = (solution) => {
    setSelectedSolutions((prev) => {
      if (prev.find((s) => s.id === solution.id)) {
        return prev.filter((s) => s.id !== solution.id);
      }
      if (prev.length < 3) {
        return [...prev, solution];
      }
      return prev;
    });
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredSolutions.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const SolutionCard = ({ solution }) => (
    <Card className="w-full transition-all duration-300 hover:shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <Avatar className="w-20 h-20 rounded-xl">
            <AvatarImage
              src={`${BASE_URL}${solution.solutionPic}`}
              className="object-cover"
              alt="Company Avatar"
            />
            <AvatarFallback>
              {solution.CompanyProfile.User.CompanyDetail.companyName[0]}
            </AvatarFallback>
          </Avatar>
          <Checkbox
            checked={selectedSolutions.some((s) => s.id === solution.id)}
            onCheckedChange={() => handleSolutionSelect(solution)}
            disabled={
              selectedSolutions.length >= 3 &&
              !selectedSolutions.some((s) => s.id === solution.id)
            }
          />
        </div>
        <CardTitle className="mt-2 text-lg font-bold">
          {solution.solutionName}
        </CardTitle>
        <Badge variant="secondary" className="mt-1">
          {solution.CompanyProfile.User.CompanyDetail.companyName}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center">
            <Sun className="mr-2 h-4 w-4" />
            <span className="text-sm">{solution.solarPanelType}</span>
          </div>
          <div className="flex items-center">
            <Zap className="mr-2 h-4 w-4" />
            <span className="text-sm">{solution.powerOutput} W</span>
          </div>
          <div className="flex items-center">
            <Battery className="mr-2 h-4 w-4" />
            <span className="text-sm">{solution.efficiency}% Efficiency</span>
          </div>
          <div className="flex items-center">
            <Shield className="mr-2 h-4 w-4" />
            <span className="text-sm">{solution.warranty} Warranty</span>
          </div>
          <div className="flex items-center">
            <DollarSign className="mr-2 h-4 w-4" />
            <span className="text-sm">${solution.price}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <a
          href={`${BASE_URL}${solution.CompanyProfile.certificate}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center text-sm text-blue-600 hover:underline"
        >
          <Award className="mr-1 h-4 w-4" />
          View Certificate
        </a>
      </CardFooter>
    </Card>
  );
  
  SolutionCard.propTypes = {
    solution: PropTypes.shape({
      id: PropTypes.number.isRequired,
      solutionName: PropTypes.string.isRequired,
      solutionPic: PropTypes.string.isRequired,
      solarPanelType: PropTypes.string.isRequired,
      powerOutput: PropTypes.number.isRequired,
      efficiency: PropTypes.number.isRequired,
      warranty: PropTypes.string.isRequired,
      price: PropTypes.number.isRequired,
      CompanyProfile: PropTypes.shape({
        User: PropTypes.shape({
          CompanyDetail: PropTypes.shape({
            companyName: PropTypes.string.isRequired,
          }).isRequired,
        }).isRequired,
        certificate: PropTypes.string.isRequired,
      }).isRequired,
    }).isRequired,
  };

  const ComparisonTable = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[200px]">Model</TableHead>
          {selectedSolutions.map((solution) => (
            <TableHead key={solution.id}>{solution.solutionName}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {[
          { key: "companyName", label: "Company" },
          { key: "solarPanelType", label: "Panel Type" },
          { key: "powerOutput", label: "Power Output" },
          { key: "efficiency", label: "Efficiency" },
          { key: "warranty", label: "Warranty" },
          { key: "price", label: "Price" },
        ].map((row) => (
          <TableRow key={row.key}>
            <TableCell className="font-medium">{row.label}</TableCell>
            {selectedSolutions.map((solution) => (
              <TableCell key={solution.id}>
                {row.key === "companyName"
                  ? solution.CompanyProfile.User.CompanyDetail.companyName
                  : solution[row.key]}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <>
      <NavBar />
      <div className="container mx-auto p-4 pb-24">
        <div className="mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative w-full md:w-1/3">
            <Input
              type="text"
              placeholder="Search solutions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="companyName">Company Name</SelectItem>
                <SelectItem value="price">Price</SelectItem>
                <SelectItem value="efficiency">Efficiency</SelectItem>
                <SelectItem value="powerOutput">Power Output</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterBy} onValueChange={setFilterBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by Company" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Companies</SelectItem>
                {companies.map((company) => (
                  <SelectItem key={company} value={company}>
                    {company}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {currentItems.map((solution) => (
            <SolutionCard key={solution.id} solution={solution} />
          ))}
        </div>
        <div className="flex justify-center mt-4 space-x-2">
          <Button
            variant="outline"
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {Array.from({ length: Math.ceil(filteredSolutions.length / itemsPerPage) }).map((_, index) => (
            <Button
              key={index}
              variant={currentPage === index + 1 ? "default" : "outline"}
              onClick={() => paginate(index + 1)}
            >
              {index + 1}
            </Button>
          ))}
          <Button
            variant="outline"
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === Math.ceil(filteredSolutions.length / itemsPerPage)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="fixed bottom-0 left-0 right-0 border-t bg-secondary p-4 flex justify-center">
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="default"
              size="lg"
              disabled={selectedSolutions.length < 2}
            >
              Compare Selected Solutions ({selectedSolutions.length}/3)
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Solar Solutions Comparison</DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[80vh]">
              <ComparisonTable />
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default SolarSolutionComparison;