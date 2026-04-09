import { defineTool } from "./tool";
import { z } from "zod";
import { writeFile, appendFile, mkdir } from "fs/promises";
import { dirname, resolve } from "path";

export const writeTool = defineTool({
  name: "write_file",
  description:
    "Write or append content to a file in the current directory. Provide filename (relative), content, and optional mode ('overwrite' or 'append').",
  schema: z.object({
    filename: z
      .string()
      .describe("The file path to write (relative to the project root)."),
    content: z.string().describe("The content to write into the file."),
    mode: z
      .enum(["overwrite", "append"])
      .optional()
      .describe(
        "Whether to overwrite the file or append. Defaults to 'overwrite'.",
      ),
  }),
  async execute({ filename, content, mode = "overwrite" }) {
    try {
      const cwd = process.cwd();
      const target = resolve(cwd, filename);

      // Prevent writing outside the project directory
      if (!target.startsWith(cwd)) {
        return `Refusing to write outside the project directory: ${filename}`;
      }

      // Ensure directory exists
      const dir = dirname(target);
      await mkdir(dir, { recursive: true });

      if (mode === "overwrite") {
        await writeFile(target, content, "utf-8");
      } else {
        await appendFile(target, content, "utf-8");
      }

      return `Successfully wrote ${content.length} bytes to ${filename} (mode=${mode}).`;
    } catch (error) {
      return `Error writing file: ${error instanceof Error ? error.message : String(error)}`;
    }
  },
});
