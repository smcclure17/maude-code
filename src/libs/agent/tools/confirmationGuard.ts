import { defineToolGuard, GuardInterrupt } from "./guard";

export const confirmationGuard = (io: {
  confirm: (msg: string) => Promise<boolean>;
}) =>
  defineToolGuard({
    name: "confirmation_guard",
    description: "Asks the user for confirmation before executing a tool.",
    timing: "before",
    async execute({ toolName }) {
      const confirmed = await io.confirm(`Run "${toolName}"?`);
      if (!confirmed)
        throw new GuardInterrupt(
          `Execution of "${toolName}" cancelled by user. Do not retry.`,
        );
    },
  });
