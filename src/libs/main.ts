import {
  msg,
  type Llm,
  type LlmOptions,
  type Message,
} from "./agent/llm-helpers";
import { ToolImplementation } from "./agent/tools/tool";
import { ui } from "./ui";
import { createInterface } from "node:readline/promises";

/**
 * Starts the main input loop for the agent. This loop will continue until the user exits.
 *
 * The loop works as follows:
 * 1. The user inputs a message.
 * 2. The message is sent to the LLM along with the conversation history and available tools.
 * 3. The LLM responds with either a text response or a tool call.
 * 4. If it's a tool call, the agent executes the tool and sends the result back to the LLM.
 * 5. The loop continues until the LLM responds with a text response, which is then displayed to the user.
 * 6. Repeat from step 1.
 *
 * @param llm The language model to use for generating responses.
 * @param tools The tools that the agent can use to interact with the environment.
 * @param options Additional options for the LLM, such as system prompt.
 */
export const inputLoop = {
  async start(
    llm: Llm,
    tools: ToolImplementation[],
    options: Omit<LlmOptions, "tools"> = {},
  ) {
    const opts = { ...options, tools: tools.map((t) => t.definition) };
    const messages: Message[] = [];

    const readline = createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    async function agentLoop() {
      const response = await llm.chat(messages, opts);

      switch (response.type) {
        case "text":
          messages.push(msg.assistant(response.content));
          ui.reply(response.content);
          break;

        case "tool_call":
          messages.push(msg.toolCall("", response.toolCalls));
          for (const toolCall of response.toolCalls) {
            const tool = tools.find((t) => t.definition.name === toolCall.name);
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

    ui.reply(
      "Hi! I'm a pretty boring coding assistant. Start asking me questions >:)",
    );

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
