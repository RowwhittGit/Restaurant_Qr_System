import React, { useEffect, useState } from "react";

const LocationCheck: React.FC = () => {
  const [locationStatus, setLocationStatus] = useState<string>("Checking...");

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationStatus("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      () => {
        setLocationStatus("✅ You are sharing your location.");
      },
      () => {
        setLocationStatus("❌ You are not sharing your location.");
      }
    );
  }, []);

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="p-6 bg-white rounded-2xl shadow-lg text-center">
        <h1 className="text-xl font-bold mb-4">Location Permission</h1>
        <p className="text-lg">{locationStatus}</p>
      </div>
    </div>
  );
};

export default LocationCheck;
