# ADR-0004: Compute dashboard metrics client-side

**Date:** 2026-07-04

## Context

The inventory page shows summary metrics at the top: total asset value, product count, and the in/low/out stock breakdown (numbers + the colored bar). This data has to be calculated from the inventory items. I had to decide where that calculation happens. Options considered:

1. A dedicated backend endpoint (e.g. `/inventory/stats`) that queries the database,
   computes the totals, and returns them.
2. Compute the metrics in JavaScript, reusing the item list already fetched for the
   table.

## Decision

Compute the metrics client-side. The page already fetches all items for the table, so the JS reuses that same array: summing `stock * bought_price` for total value, counting items per status, and setting the bar segment widths ( no extra request).

## Consequences

- **Good:** No extra network request or endpoint to build/maintain. Metrics always match the table because they come from the same data.
- **Good:** Updates automatically whenever the table reloads (after add/edit/delete).
- **Trade-off:** All items must be loaded on the client to compute totals. If the inventory grows to thousands of items (or pagination is added), the client won't have the full dataset to sum.
- **Revisit if:** pagination is introduced or the dataset grows large, then move the metrics to a backend `/stats` endpoint that computes totals over the full table in the database.