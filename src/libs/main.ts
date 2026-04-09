import { start } from "node:repl";
import { msg, type Llm, type LlmOptions, type Message } from "./agent/Llm";
import { tools } from "./agent/tools/tools";
import { ui } from "./ui";

export const inputLoop = {
  start(llm: Llm, options: LlmOptions = {}) {
    const messages: Message[] = [];
    const optionsWithTools = {
      ...options,
      tools: options.tools || tools.map((tool) => tool.definition),
    };

    ui.reply(
      "Hi! I'm a pretty boring coding assistant. Start asking me questions >:)",
    );

    async function agentLoop(
      done: (err: Error | null, result: unknown) => void,
    ) {
      const response = await llm.chat(messages, optionsWithTools);

      switch (response.type) {
        case "text":
          messages.push(msg.assistant(response.content));
          ui.reply(response.content);
          done(null, undefined);
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

          await agentLoop(done); // keep agent running until we find a text response
          break;
      }
    }
    start({
      prompt: "> ",
      async eval(raw, _ctx, _file, done) {
        const input = raw.trim();
        if (!input) return done(null, undefined);

        messages.push(msg.user(input));

        const spinner = ui.thinking();
        await agentLoop(done);
        spinner.stop();
        process.stdout.write("> "); // re-render prompt after spinner stops, since it clears the line
      },
      writer: () => "",
    });
  },
};
