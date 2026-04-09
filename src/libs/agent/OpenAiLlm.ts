import OpenAI from "openai";
import type { Llm, LlmOptions, LlmResponse, Message } from "./Llm";

export class OpenAiLlm implements Llm {
  private client = new OpenAI();
  private model = "gpt-5-mini";

  async chat(
    messages: Message[],
    options: LlmOptions = {},
  ): Promise<LlmResponse> {
    // map tools to OpenAI function format
    const tools = options.tools?.map((t) => ({
      type: "function" as const,
      function: {
        name: t.name,
        description: t.description,
        parameters: t.input_schema,
      },
    }));

    // map our internal message format to OpenAI's expected format
    const mappedMessages = messages.map((m) => {
      switch (m.role) {
        case "user":
          return { role: "user" as const, content: m.content };
        case "assistant":
          return m.toolCalls?.length
            ? {
                role: "assistant" as const,
                content: null,
                tool_calls: m.toolCalls.map((tc) => ({
                  id: tc.id,
                  type: "function" as const,
                  function: {
                    name: tc.name,
                    arguments: JSON.stringify(tc.input),
                  },
                })),
              }
            : { role: "assistant" as const, content: m.content };
        case "tool":
          return {
            role: "tool" as const,
            content: m.content,
            tool_call_id: m.toolCallId,
          };
      }
    });

    const response = await this.client.chat.completions.create({
      model: this.model,
      tools: tools,
      messages: [
        ...(options.system
          ? [{ role: "system" as const, content: options.system }]
          : []),
        ...mappedMessages,
      ],
    });

    const choice = response.choices[0];
    const message = choice.message;

    const toolCalls = message.tool_calls
      ?.filter((tc) => tc.type === "function")
      .map((tc) => ({
        id: tc.id,
        name: tc.function.name,
        input: JSON.parse(tc.function.arguments) as Record<string, unknown>,
      }));

    if (toolCalls?.length) {
      return { type: "tool_call", toolCalls };
    }
    return { type: "text", content: message.content || "" };
  }
}
