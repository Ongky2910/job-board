import React from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const MapModal = () => {
  return (
    <Dialog>
      <DialogTrigger className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
        Lihat Lokasi
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Lokasi di Peta</DialogTitle>
        </DialogHeader>
        <div className="w-full h-64">
          <iframe
            title="Google Maps"
            width="100%"
            height="100%"
            style={{ border: 0, borderRadius: "8px" }}
            loading="lazy"
            allowFullScreen
            src="https://www.google.com/maps/embed/v1/place?key=YOUR_GOOGLE_MAPS_API&q=Jakarta"
          ></iframe>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MapModal;
