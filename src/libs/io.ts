import { createInterface } from "node:readline/promises";

export interface IO {
  confirm: (message: string) => Promise<boolean>;
  prompt: (message: string) => Promise<string>;
  print: (message: string) => void;
  printDirect: (message: string) => void;
}

const readline = createInterface({
  input: process.stdin,
  output: process.stdout,
});
export const io: IO = {
  confirm: async (msg) => {
    const r = await readline.question(`${msg} (yes/no) > `);
    return r.trim().toLowerCase() === "yes";
  },
  prompt: async (msg) => {
    return (await readline.question(msg)).trim();
  },
  print: (msg) => {
    process.stdout.write(msg + "\n");
  },

  printDirect: (msg) => {
    process.stdout.write(msg);
  },
};