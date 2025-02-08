import { AppNode, AppNodeMissingInputs } from "@/types/appNode";
import { Edge } from "@xyflow/react";
import { TaskRegistry } from "./task/registry";
import {
  WorkflowExecutionPlan,
  WorkFlowExecutionPlanPhase,
} from "@/types/workflow";
import { exec } from "child_process";

export enum FlowExecutionPlanValidationError {
  INVALID_INPUTS = "INVALID_INPUTS",
  NO_ENTRY_POINT = "NO_ENTRY_POINT",
}

type FlowToExecutionPlanType = {
  executionPlan?: WorkflowExecutionPlan;
  error?: {
    type: FlowExecutionPlanValidationError;
    invalidElements?: AppNodeMissingInputs[];
  };
};

export function FlowToExecutionPlan(
  nodes: AppNode[],
  edges: Edge[]
): FlowToExecutionPlanType {
  const entryPoint = nodes.find(
    (node) => TaskRegistry[node.data.type].isEntryPoint
  );

  if (!entryPoint) {
    return {
      error: {
        type: FlowExecutionPlanValidationError.NO_ENTRY_POINT,
      },
    };
  }

  const inputsWitErrors: AppNodeMissingInputs[] = [];
  const planned = new Set<string>();

  const invalidInputs = getInvalidInputs(entryPoint, edges, planned);
  if (invalidInputs.length > 0) {
    inputsWitErrors.push({
      nodeId: entryPoint.id,
      inputs: invalidInputs,
    });
  }

  const executionPlan: WorkflowExecutionPlan = [
    {
      phase: 1,
      nodes: [entryPoint],
    },
  ];
  planned.add(entryPoint.id);

  for (
    let phase = 2;
    phase <= nodes.length && planned.size < nodes.length;
    phase++
  ) {
    const nextPhase: WorkFlowExecutionPlanPhase = { phase, nodes: [] };
    for (const currentNode of nodes) {
      if (planned.has(currentNode.id)) {
        // Node already put in the execution plan.
        continue;
      }

      const invalidInputs = getInvalidInputs(currentNode, edges, planned);
      if (invalidInputs.length > 0) {
        const incomers = getIncomers(currentNode, nodes, edges);
        if (incomers.every((incomer) => planned.has(incomer.id))) {
          inputsWitErrors.push({
            nodeId: currentNode.id,
            inputs: invalidInputs,
          });
        } else {
          // let's skip this node for now
          continue;
        }
      }

      nextPhase.nodes.push(currentNode);
    }
    for (const node of nextPhase.nodes) {
      planned.add(node.id);
    }
    executionPlan.push(nextPhase);
  }

  if (inputsWitErrors.length > 0) {
    return {
      error: {
        type: FlowExecutionPlanValidationError.INVALID_INPUTS,
        invalidElements: inputsWitErrors,
      },
    };
  }

  return { executionPlan };
}

function getInvalidInputs(node: AppNode, edges: Edge[], planned: Set<string>) {
  const invalidInputs = [];
  const inputs = TaskRegistry[node.data.type].inputs;
  for (const input of inputs) {
    const inputValue = node.data.inputs[input.name];
    const inputValueProvided = inputValue?.length > 0;
    if (inputValueProvided) {
      // this input is fine, so we can move on
      continue;
    }

    // If a value is not provided by the user then we need to check
    // if there is an output linked to the current input
    const incomingEdges = edges.filter((edge) => edge.target === node.id);

    const inputLinkedToOutput = incomingEdges.find(
      (edge) => edge.targetHandle === input.name
    );

    const requiredInputProvidedByVisitedOutput =
      input.required &&
      inputLinkedToOutput &&
      planned.has(inputLinkedToOutput.source);

    if (requiredInputProvidedByVisitedOutput) {
      continue;
    } else if (!input.required) {
      if (!inputLinkedToOutput) continue;

      if (inputLinkedToOutput && planned.has(inputLinkedToOutput.source)) {
        continue;
      }
    }
    invalidInputs.push(input.name);
  }
  return invalidInputs;
}
function getIncomers(node: AppNode, nodes: AppNode[], edges: Edge[]) {
  if (!node.id) return [];
  const incomersIds = new Set();
  edges.forEach((edge) => {
    if (edge.target === node.id) {
      incomersIds.add(edge.source);
    }
  });
  return nodes.filter((node) => incomersIds.has(node.id));
}
