# Can I run GTA?

Find out if your PC can run Grand Theft Auto, in seconds. Live at [canirungta.com](https://canirungta.com).

- Compares your RAM, GPU memory, disk space, and OS against the minimum specs of every PC GTA release.
- Reads specs from your browser, or from an optional one-line script for more accurate results.

## For AI agents

- `/llms.txt`: how to use everything below
- `/api/check?cpu=..&gpu=..&ram=..&vram=..&disk=..`: JSON verdicts (`/openapi.json` describes it)
- `/mcp`: MCP server with `check_gta_compatibility` and `list_gta_requirements`
- `/requirements.md`, `/api/versions.json`: the requirements data
- `/?cpu=..&gpu=..&ram=..`: the page pre-filled with specs

## Run locally

```sh
pnpm install
pnpm dev
```

Open `http://localhost:4321`.

## Commands

| Command          | Action                  |
| :--------------- | :---------------------- |
| `pnpm dev`       | Start dev server        |
| `pnpm build`     | Build to `./dist/`      |
| `pnpm preview`   | Preview the build       |
| `pnpm test`      | Run tests               |
| `pnpm lint`      | Lint with Biome         |
| `pnpm format`    | Auto-fix with Biome     |
| `pnpm specs`     | Refresh hardware data from BuildCores OpenDB (`-- --gpus` / `-- --cpus`) |

## Stack

Astro, Preact, Tailwind, Biome, Vitest.
