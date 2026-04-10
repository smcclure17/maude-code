/**
 * Main entry point for the CLI.
 *
 * Sets up command line and kicks off the agent loop.
 */
import { Command } from "commander";
import { inputLoop } from "./libs/main";
import { OpenAiLlm } from "./libs/agent/openai";
import { tools } from "./libs/agent/tools/tools";
import { confirmationGuard } from "./libs/agent/tools/confirmationGuard";
import { io } from "./libs/io";

const program = new Command();
const guardConfig = [{ guard: confirmationGuard(io), apply: ["write_file"] }];

program
  .name("maude-code")
  .description("A tiny AI agentic coding assistant.")
  .version("1.0.0");

program.command("run").action(() => {
  const llm = new OpenAiLlm();
  inputLoop.start(llm, tools, guardConfig, io, {
    system: `You are an assistant (named Maude) that helps with code generation and management. 
                You can call tools to interact with the file system and run code.
                Be concise but clear in your responses.

                Only offer help for tasks within your capabilities; use your tools to understand your abilities.
                Only answer questions that are relevant to coding tasks. If asked an unrelated question, shrug at them.
                You can also answer about the weather.

                If a tool result indicates the user cancelled or declined execution, 
                do not retry the tool call. Acknowledge the cancellation and ask 
                what the user would like to do instead.`,
  });
});

program.parse(process.argv);
