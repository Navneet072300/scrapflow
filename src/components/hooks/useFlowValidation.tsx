import { FlowValidationContext } from "@/components/context/FlowValidationContext";
import { useContext } from "react";

export const useFlowValidation = () => {
  const context = useContext(FlowValidationContext);
  if (!context) {
    throw new Error(
      "useFlowValidation must be used within a FlowValidationProvider"
    );
  }
  return context;
};
