// DEMO DATA ONLY — REMOVE/REPLACE WHEN REAL API IS AVAILABLE
export type DemoBus = {
  id: string;
  code: string;
  route: string;
  driver: string;
  status: string;
  etaMinutes: number;
  nextStop: string;
  pickup: string;
  progress: number;
  lat: number;
  lng: number;
};

export const demoBuses: DemoBus[] = [
  { id: "demo-bus-21", code: "TWHPS-BUS-021", route: "North Campus → Sector 18", driver: "Demo Driver (Rakesh)", status: "On Route", etaMinutes: 12, nextStop: "Sector 16 Gate", pickup: "Maple Residency stop", progress: 62, lat: 28.704, lng: 77.102 },
  { id: "demo-bus-07", code: "TWHPS-BUS-007", route: "Main Campus → Greater Kailash", driver: "Demo Driver (Imran)", status: "At Campus", etaMinutes: 0, nextStop: "Main porch", pickup: "GK-II Club", progress: 100, lat: 28.55, lng: 77.23 },
  { id: "demo-bus-14", code: "TWHPS-BUS-014", route: "East Campus → Mayur Vihar", driver: "Demo Driver (Suresh)", status: "Boarding", etaMinutes: 6, nextStop: "Pocket 4", pickup: "Pocket 4 park", progress: 18, lat: 28.61, lng: 77.3 },
];

export const demoStops = ["North Campus", "Azadpur", "Model Town", "Sector 16 Gate", "Sector 18"];

export const demoTransportAssignment = [
  { route: "North Campus → Sector 18", stop: "Maple Residency stop", vehicle: "TWHPS-BUS-021", driver: "Demo Driver (Rakesh)", status: "ASSIGNED" },
];
