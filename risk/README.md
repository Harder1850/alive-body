# Risk Schema (alive-body)

This directory defines risk schemas for execution requests.

Risk is:
- estimated, never known
- contextual, not absolute
- never suppressed
- never silently downgraded

Invariants (documented, not enforced here):
- risk never defaults to NONE
- missing risk is treated as HIGH
- uncertainty cannot be omitted
- higher risk cannot be auto-approved
- simulation allowed at any risk level
- core does not generate risk

Risk constrains execution by visibility, not by force.