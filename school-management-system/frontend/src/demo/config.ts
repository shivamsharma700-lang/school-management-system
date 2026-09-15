// Demo fixtures are opt-in. Production and default builds never silent-fallback.
// Enable only via VITE_DEMO_MODE=true (e.g. local .env.development).
export const DEMO_MODE = String(import.meta.env.VITE_DEMO_MODE ?? "false") === "true";

export const SCHOOL_NAME = "Touch Wood High Public School";
export const SCHOOL_TAGLINE = "LEARN · LEAD · SERVE";
export const SCHOOL_SHORT = "TWHPS";
export const SCHOOL_BOARD = "CBSE";
export const SCHOOL_TAGLINE_LONG = "CBSE co-educational day school · Nursery to Class XII · Delhi-NCR";
