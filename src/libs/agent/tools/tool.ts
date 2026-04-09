import { z } from "zod";
import type { ToolDefinition } from "../llm-helpers";

export interface ToolImplementation<T extends z.ZodType = z.ZodType> {
  schema: T;
  definition: ToolDefinition;
  execute: (input: z.infer<T>) => Promise<string>;
}

export function defineTool<T extends z.ZodObject<z.ZodRawShape>>(config: {
  name: string;
  description: string;
  schema: T;
  execute: (input: z.infer<T>) => Promise<string>;
}): ToolImplementation<T> {
  return {
    schema: config.schema,
    definition: {
      name: config.name,
      description: config.description,
      input_schema: z.toJSONSchema(config.schema),
    },
    execute: config.execute,
  };
}
