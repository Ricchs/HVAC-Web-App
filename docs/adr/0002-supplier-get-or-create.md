# ADR-0002: Supplier get or create function when user adds a new item

**Date:** 2026-06-30

## Context

When adding an inventory item, the item needs to be linked to a supplier (`suppliers_id` foreign key.). However, I made the form to ask the user to type a supplie *name* (e.g., Lennox) and not an ID to enhance UX. The backend must turn that name into a supplier ID before saving the item. Options considered:

1. Require users to select an existing supplier from the drop down menu. No option to add new one.
2. Make the user create the supplier first (and separately) then selecting it
3. Let the the user type any supplier name, and have the backend find the matching suppluer or create a new one automatically.

## Decision

Option 3: the form sends the supplier name and the `get_or_create_supplier` function looks up a supplier by name. If it exists, the function returns the supplier's ID. If not, it creates a new supplier row with placeholder fields and returns the new ID. The item is then saved with that new ID. Users have the option to modify the supplier details later.

## Consequences

- **Good:** Smooth UX. The user just types a name and the system handles the rest. No separate "add supplier" step, no pre-populated dropdown to maintain.
- **Good:** New suppliers get created naturally as items are added.
- **Trade-off:** Supplier creation is hidden, so typos create duplicate/junk suppliers. No validation that the name is a real supplier.
- **Trade-off:** New suppliers are created with placeholder contact info ("None registered") that must be modified later.
- **Revisit if:** duplicate suppliers become a problem —> then switch to a dropdown of existing suppliers plus an explicit "add new supplier" action. Or create a validation system.