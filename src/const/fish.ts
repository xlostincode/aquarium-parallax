export const FISH_IDS = {
  KOI: "/models/koi.glb",
  GOLD_FISH: "/models/gold_fish.glb",
  BLUE_TANG: "/models/blue_tang.glb",
  BETTA: "/models/betta.glb",
  MANDARIN_FISH: "/models/mandarin_fish.glb",
} as const;

export const FISH_DATA = {
  "/models/koi.glb": {
    animation: "Fish_Armature|Swimming_Normal",
  },
  "/models/betta.glb": {
    animation: "Fish_Armature|Swimming_Normal",
  },
  "/models/blue_tang.glb": {
    animation: "Fish_Armature|Swimming_Normal",
  },
  "/models/mandarin_fish.glb": {
    animation: "Fish_Armature|Swimming_Normal",
  },
  "/models/gold_fish.glb": {
    animation: "Armature|Swim",
  },
} as const;
