import {
  msg,
  type Llm,
  type LlmOptions,
  type Message,
} from "./agent/llm-helpers";
import {
  buildToolGuardMap,
  GuardConfig,
  GuardInterrupt,
  GuardMap,
} from "./agent/tools/guard";
import { ToolImplementation } from "./agent/tools/tool";
import { IO } from "./io";
import { ui } from "./ui";

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
    guards: GuardConfig[],
    io: IO,
    options: Omit<LlmOptions, "tools"> = {},
  ) {
    const opts = { ...options, tools: tools.map((t) => t.definition) };
    const messages: Message[] = [];
    const guardMap = buildToolGuardMap(opts.tools, guards);
    let spinner: ReturnType<typeof ui.thinking> | null = null;

    async function agentLoop() {
      const response = await llm.chat(messages, opts);

      switch (response.type) {
        case "text":
          spinner?.stop();
          spinner = null;
          messages.push(msg.assistant(response.content));
          ui.reply(response.content);
          break;

        case "tool_call":
          spinner?.stop();
          spinner = null;
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
            const params = tool.schema.parse(toolCall.input);

            let output: string;
            try {
              output = await runToolWithGuards({
                tool,
                params,
                guards: guardMap,
              });
            } catch (err) {
              output = err instanceof Error ? err.message : "Tool failed.";
            }

            messages.push(msg.toolResult(output, toolCall.id));
            ui.tool(
              tool.definition.name,
              `tool output: ${output.slice(0, 100)}`,
            );
          }

          spinner = ui.thinking();
          await agentLoop();
          break;
      }
    }

    ui.reply(
      "Hi! I'm a pretty boring coding assistant. Start asking me questions >:)",
    );

    while (true) {
      const input = await io.prompt("> ");
      if (!input) continue;
      if (input === ".exit") break;

      messages.push(msg.user(input));
      spinner = ui.thinking();
      await agentLoop();
    }
  },
};

async function runToolWithGuards({
  tool,
  params,
  guards,
}: {
  tool: ToolImplementation;
  params: any;
  guards: GuardMap;
}): Promise<string> {
  const toolName = tool.definition.name;
  const { before, after, error } = guards[toolName];

  // before guards — GuardInterrupt returns cleanly, other errors propagate
  try {
    for (const guard of before) {
      await guard.execute({ toolName, input: params });
    }
  } catch (err) {
    if (err instanceof GuardInterrupt) return err.message;
    throw err;
  }

  let output: string;
  try {
    output = await tool.execute(params);
  } catch (err) {
    for (const guard of error) {
      await guard.execute({ toolName, input: params, error: err });
    }
    throw err; // caller handles this
  }

  for (const guard of after) {
    await guard.execute({ toolName, input: params, output });
  }

  return output;
}
