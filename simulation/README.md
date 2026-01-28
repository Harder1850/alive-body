# Simulation Schema (alive-body)

This directory defines simulation schemas for execution decisions.

Simulation:
- never causes real-world effects
- may run at any risk level
- is repeatable and auditable
- is advisory only

Invariants (documented, not enforced here):
- simulation ≠ execution
- simulations may contradict each other
- simulation results may be incomplete
- uncertainty must not be hidden
- recommendation does not imply approval
- core does not run simulations

Simulation explores consequences without touching reality.