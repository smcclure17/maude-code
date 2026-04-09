export type UserMessage = { role: "user"; content: string };
export type AssistantMessage = {
  role: "assistant";
  content: string;
  toolCalls?: ToolCall[];
};
export type ToolMessage = { role: "tool"; content: string; toolCallId: string };

export type Message = UserMessage | AssistantMessage | ToolMessage;

export const msg = {
  user: (content: string): UserMessage => ({ role: "user", content }),
  assistant: (content: string): AssistantMessage => ({
    role: "assistant",
    content,
  }),
  toolCall: (content: string, toolCalls: ToolCall[]): AssistantMessage => ({
    role: "assistant",
    content,
    toolCalls,
  }),
  toolResult: (content: string, toolCallId: string): ToolMessage => ({
    role: "tool",
    content,
    toolCallId,
  }),
};

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

export interface ToolCall {
  id: string;
  name: string;
  input: Record<string, unknown>;
}

export type LlmResponse =
  | { type: "text"; content: string }
  | { type: "tool_call"; toolCalls: ToolCall[] };

export interface LlmOptions {
  system?: string;
  tools: ToolDefinition[];
  maxTokens?: number;
}

export interface Llm {
  chat(messages: Message[], options?: LlmOptions): Promise<LlmResponse>;
}
