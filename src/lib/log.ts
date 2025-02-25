import {
  Log,
  LogCollector,
  LogFunction,
  Loglevel,
  Loglevels,
} from "@/types/logs";

export function createLogCollector(): LogCollector {
  const logs: Log[] = [];
  const getAll = () => logs;
  const logFunctions = {} as Record<Loglevel, LogFunction>;
  Loglevels.forEach((level) => {
    logFunctions[level] = (message: string) => {
      logs.push({
        message,
        level,
        timestamp: new Date(),
      });
    };
  });
  return {
    getAll,
    ...logFunctions,
  };
}
