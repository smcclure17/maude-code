import { spawn } from "child_process";
import { z } from "zod";
import { defineTool } from "./tool";
import rgModule from "@vscode/ripgrep";
import { readFileSync } from "fs";

export const grepTool = defineTool({
  name: "grep",
  description:
    "Search for a pattern in files using ripgrep (rg). Returns results in vimgrep format: file:line:col:match.",
  schema: z.object({
    pattern: z
      .string()
      .describe("The search pattern (string or regex) to find."),
    path: z
      .string()
      .optional()
      .describe(
        "File or directory path to search (defaults to current directory).",
      ),
    caseInsensitive: z
      .boolean()
      .optional()
      .describe("Perform case-insensitive search."),
    recursive: z
      .boolean()
      .optional()
      .describe(
        "Whether to search recursively (default: true). If false, searches only the top level).",
      ),
  }),
  async execute(input) {
    const pattern = input.pattern;
    const searchPath = input.path ?? ".";
    const caseInsensitive = !!input.caseInsensitive;
    const recursive = input.recursive ?? true;

    // read files/dirs to ignore from .gitignore if it exists
    let ignorePatterns: string[] = [];
    try {
      const gitignore = readFileSync(".gitignore", "utf-8");
      ignorePatterns = gitignore.split("\n").filter((p) => p.trim() !== "");
    } catch (err) {
      // no .gitignore, ignorePatterns stays empty
      ignorePatterns = [".git", "node_modules"];
    }
    const ignoreArgs = ignorePatterns.flatMap((p) => ["--glob", `!${p}/**`]);

    const args: string[] = [
      "--vimgrep",
      "--hidden",
      "--no-ignore-vcs",
      ...ignoreArgs,
    ];

    if (caseInsensitive) args.push("-i");
    if (!recursive) args.push("--max-depth", "1");

    args.push(pattern, searchPath);

    return new Promise<string>((resolve) => {
      const proc = spawn(rgModule.rgPath, args, { cwd: process.cwd() });

      let stdout = "";
      let stderr = "";

      proc.stdout.on("data", (chunk) => {
        stdout += chunk.toString();
      });

      proc.stderr.on("data", (chunk) => {
        stderr += chunk.toString();
      });

      proc.on("error", (err: NodeJS.ErrnoException) => {
        resolve(`Error running rg: ${err.message}`);
      });

      proc.on("close", (code) => {
        // rg exit code 0 = matches found, 1 = no matches, >1 = error
        if (code === 0 || code === 1) {
          resolve(stdout || "");
        } else {
          const message = stderr || `rg exited with code ${code}`;
          resolve(`Error running rg: ${message}`);
        }
      });
    });
  },
});
