/**
 * Guards for tools, allowing for custom behavior on tool execution,
 * such as logging, error handling, or access control.
 */

import { ToolDefinition } from "../agent/llm-helpers";

export type ToolGuardTiming = "before" | "after";

export interface ToolGuard {
  name: string;
  description: string;
  timing: ToolGuardTiming;
  execute: (input: any) => Promise<void>;
}

export function defineToolGuard(config: {
  name: string;
  description: string;
  timing: ToolGuardTiming;
  execute: (input: any) => Promise<void>;
}): ToolGuard {
  return {
    name: config.name,
    description: config.description,
    timing: config.timing,
    execute: config.execute,
  };
}

export class GuardInterrupt extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GuardInterrupt";
  }
}

export interface GuardConfig {
  guard: ToolGuard;
  apply: string[];
}

export type GuardToolMapping = Record<string, Record<ToolGuardTiming, ToolGuard[]>>;

export function buildToolGuardMap(
  tools: ToolDefinition[],
  guards: GuardConfig[],
): GuardToolMapping {
  const map: GuardToolMapping = {};

  for (const tool of tools) {
    map[tool.name] = { before: [], after: [] };
    for (const guard of guards) {
      if (guard.apply.length === 0 || guard.apply.includes(tool.name)) {
        map[tool.name][guard.guard.timing].push(guard.guard);
      }
    }
  }

  return map;
}
