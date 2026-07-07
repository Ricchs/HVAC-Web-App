# ADR-0003: Block delete on foreign key violation

**Date:** 2026-07-01

## Context

When a user deletes an item from the inventory, that item may be referenced by other rows. For example, deleting a job with a row referencing to job_items (an item used in a job). The databases enforces a foreign key constraint, so deleting a referenced item raises an `IntegrityError`. 

I can either do a cascade delete (delete everything including the referenced rows) or I can block the delete.

## Decision

I chose the latter. The endpoint wraps the delete in a try/except: if an `IntegrityError` is raised, it rolls back and returns a 400 with a readable message ("Can't delete — this item is used in existing jobs."). Items not referenced anywhere delete normally.

## Consequences

- **Good:** Protects historical data. Job records keep pointing at real items; nothing gets orphaned.
- **Good:** The user gets a clear reason instead of a cryptic 500 error.
- **Trade-off:** Some items can't be deleted at all while they're referenced, which may frustrate a user trying to clean up.
- **Revisit if:** users need to remove referenced items, then add a "soft delete" (mark inactive and hide from lists) so history stays intact but the item disappears from the active view.