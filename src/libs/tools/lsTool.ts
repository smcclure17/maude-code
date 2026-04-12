import { defineTool } from "./tool";
import { readdirSync } from "fs";
import { z } from "zod";

export const lsTool = defineTool({
  name: "ls",
  description:
    "List files and directories in the current directory. Analogous to the Unix 'ls' command.",
  schema: z.object({}),
  async execute() {
    // Return a promise just to match the expected tool signature.
    // Also, maybe be more careful about what dir to grab from?
    return Promise.resolve(readdirSync(process.cwd()).join("\n"));
  },
});
