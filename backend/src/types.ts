export interface CanteenInfo {
  name: string;
  times: { meal: string; start: string; end: string }[];
}

export interface CanteenStatus {
  name: string;
  status: string;
  remaining?: number | null;
  next?: number | null;
}
