# Firewall Model

## Input Firewall
- Blocks malformed signals
- Rate limits inbound data
- Flags anomalous patterns
- Passes clean signals to Runtime

## Output Firewall
- Validates actions against bounds (from Constitution)
- Blocks actions exceeding MAX_ACTIONS_PER_CYCLE
- Enforces reversibility requirement
- Logs all output

## Emergency Override
Firewall may block ALL output in emergency state.
Body can enter safe-state without Runtime instruction.
