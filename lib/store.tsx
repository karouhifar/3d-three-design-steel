"use client";

import * as React from "react";
import {
  BuildingConfig,
  DEFAULT_CONFIG,
  Opening,
  OpeningType,
  WallSide,
  AddOns,
  newOpening,
} from "./building";

type Action =
  | { type: "SET"; patch: Partial<BuildingConfig> }
  | { type: "SET_ADDON"; patch: Partial<AddOns> }
  | { type: "ADD_OPENING"; openingType: OpeningType; side: WallSide }
  | { type: "REMOVE_OPENING"; id: string }
  | { type: "UPDATE_OPENING"; id: string; patch: Partial<Opening> }
  | { type: "RESET" };

function reducer(state: BuildingConfig, action: Action): BuildingConfig {
  switch (action.type) {
    case "SET":
      return { ...state, ...action.patch };
    case "SET_ADDON":
      return { ...state, addons: { ...state.addons, ...action.patch } };
    case "ADD_OPENING":
      return {
        ...state,
        openings: [...state.openings, newOpening(action.openingType, action.side)],
      };
    case "REMOVE_OPENING":
      return { ...state, openings: state.openings.filter((o) => o.id !== action.id) };
    case "UPDATE_OPENING":
      return {
        ...state,
        openings: state.openings.map((o) =>
          o.id === action.id ? { ...o, ...action.patch } : o
        ),
      };
    case "RESET":
      return DEFAULT_CONFIG;
    default:
      return state;
  }
}

interface Ctx {
  config: BuildingConfig;
  set: (patch: Partial<BuildingConfig>) => void;
  setAddon: (patch: Partial<AddOns>) => void;
  addOpening: (type: OpeningType, side: WallSide) => void;
  removeOpening: (id: string) => void;
  updateOpening: (id: string, patch: Partial<Opening>) => void;
  reset: () => void;
}

const StoreContext = React.createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [config, dispatch] = React.useReducer(reducer, DEFAULT_CONFIG);

  const value = React.useMemo<Ctx>(
    () => ({
      config,
      set: (patch) => dispatch({ type: "SET", patch }),
      setAddon: (patch) => dispatch({ type: "SET_ADDON", patch }),
      addOpening: (openingType, side) =>
        dispatch({ type: "ADD_OPENING", openingType, side }),
      removeOpening: (id) => dispatch({ type: "REMOVE_OPENING", id }),
      updateOpening: (id, patch) => dispatch({ type: "UPDATE_OPENING", id, patch }),
      reset: () => dispatch({ type: "RESET" }),
    }),
    [config]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useBuilding(): Ctx {
  const ctx = React.useContext(StoreContext);
  if (!ctx) throw new Error("useBuilding must be used within StoreProvider");
  return ctx;
}
