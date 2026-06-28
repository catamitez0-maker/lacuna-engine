# Daily Pulse

Daily Pulse settles one story day for one city.

Flow:

1. Start with `stateBefore`.
2. Apply trace effects.
3. Resolve anchor variants against the updated state.
4. Apply selected variant effects.
5. Return `stateAfter`, `traceIds`, and `selectedVariantIds`.
6. Generate an Observer Report.

The first implementation is deterministic and synchronous.
