import chalk from "chalk";
import boxen from "boxen";
import { IO } from "./io";

/**
 * Simple UI utilities for formatting agent responses on the CLI.
 */
export class UI {
  constructor(private readonly io: IO) { }

  reply(content: string) {
    this.io.print(
      boxen(chalk.white(content), {
        padding: 0.5,
        margin: { top: 1, bottom: 1, left: 1, right: 1 },
        borderColor: "cyan",
        borderStyle: "round",
        backgroundColor: "#004466",
        width: process.stdout.columns - 4 || 120,
      }) + "\n",
    );
  }

  tool(name: string, output: string) {
    this.io.print(
      chalk.dim(`using tool ${name}: `) + chalk.gray(output) + "\n",
    );
  }

  error(msg: string) {
    this.io.print(chalk.red(`✗ ${msg}`) + "\n");
  }

  thinking() {
    const frames = ["+", "/", "-"];
    let i = 0;
    let status = "thinking...";

    const render = () => {
      this.io.printDirect(
        "\r\x1b[2K" + chalk.dim(frames[i % frames.length] + " " + status),
      );
    };

    const timer = setInterval(() => {
      i++;
      render();
    }, 400);

    return {
      update: (next: string) => {
        status = next;
        render();
      },
      stop: () => {
        clearInterval(timer);
        this.io.print("\r\x1b[2K");
      },
    };
  }
}
