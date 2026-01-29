# ALIVE Body - System Connector

Connects alive-body to alive-system via WebSocket.

## Files

```
nervous-system/
├── system-connector.js    # WebSocket connection to alive-system
├── observation-handler.js # Processes observations, uses AI adapter
└── index.js               # Wires connector + handler
start-body.js              # Standalone runner for testing
```

## Installation

1. Copy `nervous-system/` folder to `alive-body/nervous-system/`
2. Copy `start-body.js` to `alive-body/start-body.js`
3. Ensure `ws` is in package.json:
   ```json
   "dependencies": {
     "ws": "^8.15.0"
   }
   ```
4. Run `npm install`

## Usage

### Option 1: Standalone (for testing)

```bash
cd alive-body
node start-body.js
```

### Option 2: Integrate into existing entry point

In your main entry file (e.g., `index.js`):

```javascript
import { initSystemIntegration } from './nervous-system/index.js';

// Your existing initialization...

// Add system integration
initSystemIntegration();
```

## Requirements

- alive-system running on port 7070
- AI adapter configured with API keys:
  ```bash
  set ANTHROPIC_API_KEY=sk-ant-...
  # or
  set OPENAI_API_KEY=sk-...
  ```

## Signal Flow

```
Host (browser)
    ↓ observation
alive-system (7070)
    ↓ observation
alive-body
    ↓ handleObservation()
    ↓ ask() → AI adapter → LLM
    ↓ render
alive-system
    ↓ render
Host (browser)
```

## Startup Order

1. `alive-system` (port 7070)
2. `alive-body` (connects to system)
3. `alive-host-ui` (port 3001)
