import { useEffect, useState } from "react";
import axios from "axios";

export default function GeoCheck() {
  const [status, setStatus] = useState<string>("Fetching location...");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setStatus("Geolocation not supported in this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ lat: latitude, lng: longitude });

        try {
          const res = await axios.post("http://localhost:3000/api/location", {
            lat: latitude,
            lng: longitude,
          });

          console.log(res.data);
          if (res.data.inside) {
            setStatus("✅ You are inside the restaurant area.");
          } else {
            setStatus("❌ You are outside the restaurant area.");
          }
        } catch (error) {
          setStatus("Error checking location.");
        }
      },
      (err) => {
        setStatus("Error fetching location: " + err.message);
      },
      { enableHighAccuracy: true }
    );
  }, []);

  return (
    <div className="p-4 text-center">
      <h1 className="text-xl font-bold mb-2">Restaurant Location Check</h1>
      <p>{status}</p>
      {coords && (
        <p className="mt-2">
          📍 Your Location: {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
        </p>
      )}
    </div>
  );
}
