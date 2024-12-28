import PropTypes from "prop-types";
import { Card, CardContent } from "@/components/ui/card";

const InfoCard = ({ systemSize, panelCount }) => (
  <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg">
    <CardContent className="p-8 space-y-6">
      <div className="space-y-2">
        <h3 className="text-2xl font-semibold">System Details</h3>
        <p className="text-sm text-muted-foreground">
          Your recommended solar configuration
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6 pt-4">
        <div className="space-y-2">
          <span className="text-sm text-muted-foreground">System Size</span>
          <p className="text-2xl font-semibold">{systemSize} kWp</p>
        </div>
        <div className="space-y-2">
          <span className="text-sm text-muted-foreground">Panel Count</span>
          <p className="text-2xl font-semibold">{panelCount}</p>
        </div>
      </div>

      <div className="rounded-lg p-4 bg-muted/50">
        <p className="text-sm text-center">
          Optimized for your energy needs and roof space 🎯
        </p>
      </div>
    </CardContent>
  </Card>
);

InfoCard.propTypes = {
  systemSize: PropTypes.number.isRequired,
  panelCount: PropTypes.number.isRequired,
};

export default InfoCard;