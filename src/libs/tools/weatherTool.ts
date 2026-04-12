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
    const weather = `The current weather in ${input.location} is sunny with a temperature of 65°F.`;
    // Again, just return a promise to match tool signature for now.
    return Promise.resolve(weather);
  },
});
