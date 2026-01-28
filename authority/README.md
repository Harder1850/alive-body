# Authority Model (alive-body)

This directory defines the authority schema for execution decisions.

Authority is:
- explicit
- bounded
- revocable
- never inferred
- never self-asserted by core

Invariants (documented, not enforced here):
- authority expires
- authority does not accumulate silently
- authority cannot widen scope
- delegation cannot exceed parent scope
- human authority can revoke system authority
- core cannot grant, revoke, or modify authority

Authority allows execution to be considered; it never guarantees execution.