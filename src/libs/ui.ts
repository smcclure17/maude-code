import chalk from "chalk";
import boxen from "boxen";

/**
 * Simple UI utilities for formatting agent responses on the CLI.
 */
export const ui = {
  reply(content: string) {
    process.stdout.write(
      boxen(chalk.white(content), {
        padding: 0.5,
        margin: { top: 1, bottom: 1, left: 1, right: 1 },
        borderColor: "cyan",
        borderStyle: "round",
        backgroundColor: "#004466",
      }) + "\n",
    );
  },

  tool(name: string, output: string) {
    process.stdout.write(chalk.dim(`⚙ ${name}: `) + chalk.gray(output) + "\n");
  },

  error(msg: string) {
    process.stdout.write(chalk.red(`✗ ${msg}`) + "\n");
  },

  thinking() {
    const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
    let i = 0;
    let status = "thinking...";

    const render = () => {
      process.stdout.write(
        "\r\x1b[2K" + chalk.dim(frames[i % frames.length] + " " + status),
      );
    };

    const timer = setInterval(() => {
      i++;
      render();
    }, 80);

    return {
      update: (next: string) => {
        status = next;
        render();
      },
      stop: () => {
        clearInterval(timer);
        process.stdout.write("\r\x1b[2K");
      },
    };
  },
};
