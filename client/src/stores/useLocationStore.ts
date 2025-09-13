// src/store/useLocationStore.ts
import { create } from "zustand";
import axios from "axios";

type LocationState = {
  inside: boolean | null; // null = checking, true = inside, false = outside
  checking: boolean;
  error: string | null;
  checkLocation: () => void;
};

export const useLocationStore = create<LocationState>((set) => ({
  inside: null,
  checking: false,
  error: null,

  checkLocation: async () => {
    if (!navigator.geolocation) {
      set({ inside: null, error: "Geolocation not supported" });
      return;
    }

    set({ checking: true, error: null });

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;

          const res = await axios.post("http://localhost:3000/api/location", {
            lat: latitude,
            lng: longitude,
          });

          set({ inside: res.data.inside, checking: false });
        } catch (err) {
          set({ error: "Server error", checking: false });
        }
      },
      () => {
        set({ inside: null, error: "Location permission denied", checking: false });
      }
    );
  },
}));
