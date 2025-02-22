export const Loglevels = ["info", "error", "warning"] as const;
export type Loglevel = (typeof Loglevels)[number];
export type LogFunction = (message: string) => void;
export type Log = {
  message: string;
  level: Loglevel;
  timestamp: Date;
};
export type LogCollector = {
  getAll(): Log[];
} & {
  [K in Loglevel]: LogFunction;
};
