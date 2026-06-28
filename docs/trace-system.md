# Trace System

Player actions do not directly edit mainline story content. They produce
structured traces.

Trace fields include:

- `type`
- `visibility`
- `weight`
- `effects`
- `createdAt`

Daily Pulse reads trace effects and updates numeric city state. Future trace
ledgers can persist more provenance without changing the action contract.
