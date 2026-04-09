import z from "zod";
import { defineTool } from "./tool";

export const weatherTool = defineTool({
  name: "get_weather",
  description: "Get the current weather for a given location.",
  schema: z.object({
    location: z
      .string()
      .describe("The city or location to get the weather for."),
  }),
  async execute(input) {
    return `The current weather in ${input.location} is sunny with a temperature of 65°F.`;
  },
});
