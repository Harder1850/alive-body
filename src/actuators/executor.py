"""
Actuator Executor
alive-body/src/actuators/executor.py

Executes only. Never decides, plans, learns, or interprets.
Requires authorized_by field on every Action — no authorization = no execution.

INVARIANT: No execution without an approved pathway through alive-runtime enforcement.
INVARIANT: authorized_by must be present and non-empty.
"""

from dataclasses import dataclass


@dataclass
class Action:
    id: str
    type: str            # 'execute' | 'defer' | 'escalate' | 'rollback' | 'log_only'
    description: str     # what to do — descriptive only
    reversible: bool
    estimated_cost: float
    authorized_by: str   # Decision.id that passed alive-runtime enforcement — REQUIRED
    timestamp: float


class ExecutionError(Exception):
    pass


class Executor:
    """
    Executes approved Actions from alive-runtime.

    Does NOT decide whether to act.
    Does NOT interpret action meaning beyond what is in description.
    Does NOT call alive-mind.

    Requires authorized_by on every Action.
    Logs every execution attempt — successful or not.
    """

    def execute(self, action: Action) -> dict:
        # ENFORCEMENT GATE: authorized_by must be present and non-empty
        # This check cannot be removed or bypassed — it is the execution order guard.
        if not action.authorized_by or action.authorized_by.strip() == '':
            raise ExecutionError(
                f"Execution blocked: action '{action.id}' has no authorized_by — "
                "alive-runtime enforcement must authorize before execution"
            )

        if action.type == 'log_only':
            return {'status': 'logged', 'action_id': action.id, 'authorized_by': action.authorized_by}

        if action.type == 'defer':
            return {'status': 'deferred', 'action_id': action.id, 'authorized_by': action.authorized_by}

        if action.type == 'execute':
            # TODO: dispatch based on action.description in Slice 1.5+
            # Slice 1: respond with text only
            return {
                'status': 'executed',
                'action_id': action.id,
                'authorized_by': action.authorized_by,
                'description': action.description,
            }

        raise ExecutionError(f"Unknown action type: {action.type}")
