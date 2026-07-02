# Daily Pulse

Daily Pulse settles one story day for one city.

Flow:

1. Start with `stateBefore`.
2. Apply trace effects.
3. Resolve anchor variants against the updated state and trace conditions.
4. Apply selected variant effects.
5. Apply World Pack `stateRules`.
6. Return `stateAfter`, `traceIds`, `selectedVariantIds`, and `ruleAudit`.
7. Generate an Observer Report.

The first implementation is deterministic and synchronous.

State rule enforcement modes:

- `report`: record violations without changing state.
- `clamp`: adjust the affected state key to fit bounds or daily delta.
- `reject`: stop settlement with an error.
