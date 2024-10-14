import { useState } from "react";
import PropTypes from "prop-types";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Zap,
  Plus,
  Sun,
  Battery,
  Calendar,
  DollarSign,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

const SolarSolutionCard = ({ solution, BASE_URL, onDelete, onEdit }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl">
        <div className="relative aspect-video">
          {solution.solutionPic ? (
            <img
              src={`${BASE_URL}${solution.solutionPic}`}
              alt={`${solution.solutionName}`}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Sun className="h-12 w-12" />
            </div>
          )}
          <Badge className="absolute top-2 right-2 bg-black/50 text-white">
            {solution.solarPanelType}
          </Badge>
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg mb-2 truncate">
            {solution.solutionName}
          </h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-1">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span>{solution.powerOutput} W</span>
            </div>
            <div className="flex items-center gap-1">
              <Battery className="h-4 w-4 text-green-500" />
              <span>{solution.efficiency}%</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4 text-blue-500" />
              <span>{solution.warranty} years</span>
            </div>
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="font-semibold">RM{solution.price}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-4 flex justify-between">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="">
                <Eye className="h-4 w-4 mr-1" /> View Details
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{solution.solutionName}</DialogTitle>
                <DialogDescription>
                  Complete details of the solar solution
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <img
                  src={`${BASE_URL}${solution.solutionPic}`}
                  alt={solution.solutionName}
                  className="w-full h-48 object-cover rounded-md"
                />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Panel Type</p>
                    <p className="text-sm text-gray-500">
                      {solution.solarPanelType}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Power Output</p>
                    <p className="text-sm text-gray-500">
                      {solution.powerOutput} W
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Efficiency</p>
                    <p className="text-sm text-gray-500">
                      {solution.efficiency}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Warranty</p>
                    <p className="text-sm text-gray-500">
                      {solution.warranty} years
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium">Price</p>
                  <p className="text-lg font-semibold">RM{solution.price}</p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(solution.id)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(solution.id)}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

const SolarSolutionsSection = ({ profile, BASE_URL, onDelete, navigate }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredSolutions = profile.SolarSolutions?.filter((solution) =>
    solution.solutionName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className="shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle>
          <span className="flex items-center gap-2 text-2xl font-bold">
            <Zap className="h-6 w-6 text-yellow-500" />
            Solar Solutions
          </span>
        </CardTitle>
      </CardHeader>
      <Separator className="mb-4" />
      <CardContent>
        {profile.SolarSolutions?.length > 0 ? (
          <>
            <div className="mb-4">
              <Input
                type="text"
                placeholder="Search solutions..."
                className="w-full p-2 border rounded-md"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <ScrollArea className="h-[600px] w-full pr-4">
              <AnimatePresence>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredSolutions.map((solution) => (
                    <SolarSolutionCard
                      key={solution.id}
                      solution={solution}
                      BASE_URL={BASE_URL}
                      onDelete={onDelete}
                      onEdit={(id) =>
                        navigate(
                          `/company-dashboard/company-profile/company-edit-solution/${id}`
                        )
                      }
                    />
                  ))}
                </div>
              </AnimatePresence>
            </ScrollArea>
          </>
        ) : (
          <div className="flex flex-col justify-center items-center h-64 rounded-lg">
            <Sun className="h-12 w-12 text-yellow-500 mb-4" />
            <p className="text-lg mb-4">No Solar Solutions available yet.</p>
            <Link to="/company-dashboard/company-profile/company-add-solution">
              <Button variant="secondary">Add your first solar solution</Button>
            </Link>
          </div>
        )}
      </CardContent>
      {profile.SolarSolutions?.length > 0 && (
        <CardFooter className="flex justify-end pt-4">
          <Link to="/company-dashboard/company-profile/company-add-solution">
            <Button variant="outline" size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add new solar solution
            </Button>
          </Link>
        </CardFooter>
      )}
    </Card>
  );
};

SolarSolutionsSection.propTypes = {
  profile: PropTypes.shape({
    SolarSolutions: PropTypes.arrayOf(
      PropTypes.shape({
        solutionPic: PropTypes.string,
        solutionName: PropTypes.string,
        solarPanelType: PropTypes.string,
        powerOutput: PropTypes.string,
        efficiency: PropTypes.string,
        warranty: PropTypes.string,
        price: PropTypes.string,
        id: PropTypes.string,
      })
    ).isRequired,
  }).isRequired,
  BASE_URL: PropTypes.string.isRequired,
  onDelete: PropTypes.func.isRequired,
  navigate: PropTypes.func.isRequired,
};

SolarSolutionCard.propTypes = {
  solution: PropTypes.shape({
    solutionPic: PropTypes.string,
    solutionName: PropTypes.string,
    solarPanelType: PropTypes.string,
    powerOutput: PropTypes.string,
    efficiency: PropTypes.string,
    warranty: PropTypes.string,
    price: PropTypes.string,
    id: PropTypes.string,
  }).isRequired,
  BASE_URL: PropTypes.string.isRequired,
  onDelete: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
};

export default SolarSolutionsSection;
