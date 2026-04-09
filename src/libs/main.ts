/**
 * Main agent loop and entry point for the main agent loop.
 *
 * This is where the agent interacts with the LLM and tools.
 */

import {
  msg,
  type Llm,
  type LlmOptions,
  type Message,
} from "./agent/llm-helpers";
import { tools as globalTools } from "./agent/tools/tools";
import { ui } from "./ui";
import { createInterface } from "node:readline/promises";

export const inputLoop = {
  async start(llm: Llm, options: LlmOptions = { tools: [] }) {
    const messages: Message[] = [];

    const readline = createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    ui.reply(
      "Hi! I'm a pretty boring coding assistant. Start asking me questions >:)",
    );

    async function agentLoop() {
      const response = await llm.chat(messages, options);

      switch (response.type) {
        case "text":
          messages.push(msg.assistant(response.content));
          ui.reply(response.content);
          break;

        case "tool_call":
          messages.push(msg.toolCall("", response.toolCalls));
          for (const toolCall of response.toolCalls) {
            const tool = globalTools.find(
              (t) => t.definition.name === toolCall.name,
            );
            if (!tool) {
              messages.push(
                msg.toolResult(
                  `Tool "${toolCall.name}" not found.`,
                  toolCall.id,
                ),
              );
              ui.error(`Tool "${toolCall.name}" not found.`);
              continue;
            }

            ui.tool(tool.definition.name, JSON.stringify(toolCall.input));
            const parsed = tool.schema.parse(toolCall.input);
            const output = await tool.execute(parsed);
            messages.push(msg.toolResult(output, toolCall.id));
          }

          await agentLoop(); // keep agent running until we find a text response
          break;
      }
    }

    // Run the loop: get user input, send to LLM, execute tools, repeat.
    while (true) {
      const input = (await readline.question("> ")).trim();
      if (!input) continue;
      if (input === ".exit") break;

      messages.push(msg.user(input));

      const spinner = ui.thinking();
      await agentLoop();
      spinner.stop();
    }

    readline.close();
  },
};
