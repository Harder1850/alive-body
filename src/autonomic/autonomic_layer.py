"""
Autonomic / Survival Layer
alive-body/src/autonomic/autonomic_layer.py
Overrides resources only. Never reasons, decides, or escalates purpose.
"""
from dataclasses import dataclass
from enum import Enum

class AutonomicMode(Enum):
    NORMAL   = "normal"
    SURVIVAL = "survival"

@dataclass
class AutonomicState:
    mode: AutonomicMode
    threat_detected: bool
    resource_level: float
    context_collapsed: bool
    background_suspended: bool
    collapse_reason: str | None

class AutonomicLayer:
    RESOURCE_COLLAPSE_THRESHOLD = 0.15
    def evaluate(self, resource_level: float, latency_ms: float) -> AutonomicState:
        raise NotImplementedError("Autonomic layer not yet implemented")

