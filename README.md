# ALIVE Body

Execution layer for ALIVE. Body acts, Brain decides.

## Components

```
alive-body/
├── adapters/
│   ├── ai/           # LLM access (Anthropic, OpenAI)
│   ├── web/          # Website creation
│   └── self-site/    # ALIVE's own documentation site
├── core/
│   ├── identity.js   # Who ALIVE is
│   ├── memory.js     # Persistent memory
│   ├── experience.js # Append-only experience log
│   ├── cognition.js  # The cognitive loop
│   └── index.js      # Core entry point
├── nervous-system/
│   ├── system-connector.js    # WebSocket to alive-system
│   ├── observation-handler.js # Routes observations through Core
│   └── index.js
└── start-body.js     # Entry point
```

## Setup

```bash
npm install
```

## Running

Requires `alive-system` running on port 7070.

```bash
# Set API key
set ANTHROPIC_API_KEY=your-key-here   # Windows
export ANTHROPIC_API_KEY=your-key-here # Mac/Linux

# Start
node start-body.js
```

## What it does

1. Connects to alive-system (WebSocket)
2. Receives observations (user messages)
3. Routes through Core (perceive → remember → think → decide → learn)
4. Executes actions via adapters
5. Returns responses

## Adapters

| Adapter | Purpose |
|---------|---------|
| AI | Multi-provider LLM (Claude, GPT) |
| Web | Create/manage websites |
| Self-site | ALIVE's own documentation |

## Core

- **Identity**: Who ALIVE is (immutable principles)
- **Memory**: Facts, episodes, skills (persistent)
- **Experience**: Append-only log of everything
- **Cognition**: Single cognitive loop

## Runtime Data

These folders are created at runtime (gitignored):

- `sites/` - Websites ALIVE creates
- `memory/` - Persistent memory storage
- `experience/` - Experience logs

## Architecture

```
Host → System → Body → Core → LLM
                  ↓
              Adapters (AI, Web, File)
```

Body executes. Core decides. System routes.
