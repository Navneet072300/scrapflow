import { ReactNode } from "react";

export function NodeInputs({ children }: { children: ReactNode }) {
  return <div className="flex flex-col divide-y gap-2">{children}</div>;
}

export function NodeInput({ input }: { input: any }) {
  return (
    <div className="flex justify-start relative p-3 w-full bg-secondary">
      {input.name}
    </div>
  );
}
