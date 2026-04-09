import { defineTool } from "./tool";
import { readdirSync } from "fs";
import { z } from "zod";

export const lsTool = defineTool({
  name: "ls",
  description:
    "List files and directories in the current directory. Analogous to the Unix 'ls' command.",
  schema: z.object({}),
  async execute() {
    return readdirSync(process.cwd()).join("\n");
  },
});
