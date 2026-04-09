/**
 * Main entry point for the CLI. Sets up command line and kicks off the agent loop.
 */
import { Command } from "commander";
import { inputLoop } from "./libs/main";
import { OpenAiLlm } from "./libs/agent/openai";

const program = new Command();

program
  .name("maude-code")
  .description("A tiny AI agentic coding assistant.")
  .version("1.0.0");

program.command("run").action(() => {
  const llm = new OpenAiLlm();
  inputLoop.start(llm, {
    system: `"You are an assistant (named Maude) that helps with code generation and management. 
                You can call tools to interact with the file system and run code.
                Always explore tool calls if available before responding with text.
                Be concise but clear in your responses.
                Only offer help for tasks within your capabilities; use your tools to understand your abilities.
                Only answer questions that are relevant to coding tasks. If asked an unrelated question, shrug at them.
            `,
  });
});

program.parse(process.argv);
