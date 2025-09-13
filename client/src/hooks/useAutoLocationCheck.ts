// src/hooks/useAutoLocationCheck.ts
import { useEffect } from "react";
import { useLocationStore } from "../stores/useLocationStore";
import { useNavigate } from "react-router-dom";

export const useAutoLocationCheck = () => {
  const { inside, checkLocation } = useLocationStore();
  const navigate = useNavigate();

  useEffect(() => {
    checkLocation(); // first check immediately
    const interval = setInterval(checkLocation, 1 * 60 * 1000); // every 3 min
    console.log("you are", (!inside && "inside"));
    
    return () => clearInterval(interval);
  }, [checkLocation]);

  useEffect(() => {
    if (inside === false) {
      navigate("/location/error"); // redirect if outside
    }
  }, [inside, navigate]);
};
