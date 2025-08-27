import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface AppState {
  bounds: { x: number; y: number; z: number };
  totalFishCount: number;
  totalSchoolCount: number;
  totalPebbles: number;
  totalSeaweed: number;
  totalBubbles: number;

  experienceStarted: boolean;
  startExperience: () => void;
}

export const useAppStore = create<AppState>()(
  devtools(
    (set) => ({
      bounds: { x: 60, y: 10, z: 10 },
      totalFishCount: 15,
      totalSchoolCount: 5,
      totalPebbles: 50,
      totalSeaweed: 250,
      totalBubbles: 20,

      experienceStarted: false,
      startExperience: () => set({ experienceStarted: true }),
    }),
    {
      name: "app-storage",
    }
  )
);
