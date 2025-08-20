import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface AppState {
  bounds: { x: number; y: number; z: number };
  totalFishCount: number;
  totalSchoolCount: number;
}

export const useAppStore = create<AppState>()(
  devtools(
    () => ({
      bounds: { x: 60, y: 10, z: 10 },
      totalFishCount: 10,
      totalSchoolCount: 5,
    }),
    {
      name: "app-storage",
    }
  )
);
