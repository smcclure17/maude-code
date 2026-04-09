import { catTool } from "./catTool";
import { lsTool } from "./lsTool";
import { weatherTool } from "./weatherTool";
import { writeTool } from "./writeTool";

/**
 * Exhaustive list of all tools that the agent has access to.
 *
 * When adding a new tool, be sure to add it to this list so that the agent can use it.
 */
export const tools = [weatherTool, lsTool, catTool, writeTool];
