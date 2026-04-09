# Maude Code

A tiny, WIP, kinda-agentic AI CLI tool to help with development. Trying to create my own
~~Claude~~ Code from scratch. Shoutout Maude Apatow for name inspiration.

![alt text](image.png)

## Usage

I haven't put this on NPM. To run this locally like you would Claude Code:

1. Clone this repo
2. Build the package with

   ```bash
   npm ci && npm run build
   ```

3. Link the package locally
   - In the current terminal, run

     ```bash
     npm link
     ```

   - Then, in the terminal/directory you want to use this in (e.g, your code project), run

     ```bash
     npm link maude
     ```

     (Make sure you're using Node v22)

4. Set OpenAI key environment variable with

   ```bash
   export OPENAPI_KEY=sk-your-key-here
   ```

5. Finally Start the CLI by running

   ```bash
   maude run
   ```

## Features

It's a WIP, but the CLI is built on Node's REPL as an input loop, with AI Agent evaluation on every message.
The agent integrates with [tools](src/libs/agent/tools/tools.ts), discrete functions
that allow the agent to interact with the codebase. Currently, tools exist to list files, and read files; I'll
(hopefully) add more soon.

TODO:

- [] Anthropic adapters / configurable models
- [] Grep and search tools
- [] Write file edit access for the agent
- [] Better formatting
