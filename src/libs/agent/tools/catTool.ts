import { defineTool } from "./tool";
import { z } from "zod";
import { readFile } from "fs/promises";

export const catTool = defineTool({
  name: "cat",
  description:
    "Read the contents of a file in the current directory. Analogous to the Unix 'cat' command.",
  schema: z.object({
    filename: z.string().describe("The name of the file to read."),
  }),
  async execute({ filename }) {
    try {
      const content = await readFile(filename, "utf-8");
      return content;
    } catch (error) {
      return `Error reading file: ${error instanceof Error ? error.message : String(error)}`;
    }
  },
});
