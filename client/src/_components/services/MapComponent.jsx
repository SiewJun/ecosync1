import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Map } from "lucide-react";
import { loadGoogleMaps } from '../../utils/googleMaps';

function MapComponent({ center, onPolygonComplete }) {
  const mapRef = useRef(null);
  const [drawingManager, setDrawingManager] = useState(null);
  const [polygons, setPolygons] = useState([]);
  const [showGuide, setShowGuide] = useState(true);

  useEffect(() => {
    loadGoogleMaps(() => {
      if (window.google && window.google.maps) {
        const map = new window.google.maps.Map(mapRef.current, {
          center,
          zoom: 18,
          tilt: 45,
          mapTypeId: 'hybrid', // Changed to 'hybrid' to combine satellite and road names
          mapTypeControl: false,
          fullscreenControl: false,
          streetViewControl: false,
        });

        const drawingManagerInstance = new window.google.maps.drawing.DrawingManager({
          drawingMode: window.google.maps.drawing.OverlayType.POLYGON,
          drawingControl: true,
          drawingControlOptions: {
            position: window.google.maps.ControlPosition.TOP_CENTER,
            drawingModes: ['polygon'],
          },
          polygonOptions: {
            fillColor: '#FF0000',
            fillOpacity: 0.3,
            strokeWeight: 2,
            clickable: false,
            editable: true,
            zIndex: 1,
          },
        });

        drawingManagerInstance.setMap(map);
        setDrawingManager(drawingManagerInstance);

        window.google.maps.event.addListener(drawingManagerInstance, 'overlaycomplete', (event) => {
          if (event.type === 'polygon') {
            const polygon = event.overlay;
            setPolygons((prevPolygons) => [...prevPolygons, polygon]);
            const area = window.google.maps.geometry.spherical.computeArea(polygon.getPath());
            onPolygonComplete(area);
            setShowGuide(false);
          }
        });
      }
    });
  }, [center, onPolygonComplete]);

  const resetMap = () => {
    polygons.forEach(polygon => polygon.setMap(null));
    setPolygons([]);
    if (drawingManager) {
      drawingManager.setDrawingMode(window.google.maps.drawing.OverlayType.POLYGON);
    }
    setShowGuide(true);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Map className="w-5 h-5" />
          <span>Draw Your Roof Area</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <div ref={mapRef} className="w-full h-[500px] rounded-md overflow-hidden" />
          {showGuide && (
            <div className="fixed inset-0 flex flex-col items-center justify-center bg-black bg-opacity-80 text-white text-center p-4 z-50">
              <h3 className="text-lg font-semibold mb-2">How to Draw Your Roof Area</h3>
              <p className="mb-4">Use the Google Maps tools to pinpoint around the area of your house&apos;s roof. Click to start drawing a polygon and click again to add each point. Complete the polygon by clicking on the starting point.</p>
              <img src="/DemoSolarEstimation.gif" alt="Drawing Polygon Demo" className="mb-4 w-full max-w-screen-md rounded-md shadow-lg" />
              <Button variant="default" onClick={() => setShowGuide(false)}>
                Got it!
              </Button>
            </div>
          )}
        </div>
        <div className="mt-4">
          <Button variant="outline" onClick={resetMap}>
            Clear Map Annotations
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

MapComponent.propTypes = {
  center: PropTypes.object.isRequired,
  onPolygonComplete: PropTypes.func.isRequired,
};

export default MapComponent;