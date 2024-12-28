import PropTypes from "prop-types";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

const SavingsCard = ({ oldValue, newValue, unit }) => (
  <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg">
    <CardContent className="p-8 space-y-6">
      <div className="space-y-2">
        <h3 className="text-2xl font-semibold">Monthly Bill Impact</h3>
        <p className="text-sm text-muted-foreground">
          See how solar affects your electricity costs
        </p>
      </div>

      <div className="space-y-6 pt-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-sm text-muted-foreground">Current Bill</span>
            <p className="text-xl line-through text-muted-foreground">
              {unit}{oldValue}
            </p>
          </div>
          <ArrowRight className="h-5 w-5 text-muted-foreground" />
          <div className="space-y-1 text-right">
            <span className="text-sm text-muted-foreground">New Bill</span>
            <p className="text-2xl font-semibold">
              {newValue === "0.00" ? "FREE" : `${unit}${newValue}`}
            </p>
          </div>
        </div>

        <div className="rounded-lg p-4 bg-muted/50">
          <p className="text-sm text-center">
            {newValue === "0" 
              ? "Your solar system will eliminate your electricity bill completely ✨" 
              : `Monthly savings: ${unit}${(parseFloat(oldValue) - parseFloat(newValue)).toFixed(2)} 💰`}
          </p>
        </div>
      </div>
    </CardContent>
  </Card>
);

SavingsCard.propTypes = {
  title: PropTypes.string.isRequired,
  oldValue: PropTypes.string,
  newValue: PropTypes.string,
  value: PropTypes.string,
  unit: PropTypes.string.isRequired,
};

export default SavingsCard;