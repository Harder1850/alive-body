/**
 * Sensor Registry — Plug-and-Play sensor autonomy for alive-body.
 *
 * New sensors register themselves with a schema at startup. Registration
 * automatically emits a NEW_SENSOR_DETECTED Signal into the pipeline so
 * alive-mind can use its World Model to deduce how to use the new data.
 *
 * Invariant: alive-body NEVER decides what to do with sensor data.
 * That responsibility belongs to alive-mind via the STG path.
 */

import { makeSignal, type Signal } from '../../../alive-constitution/contracts/signal';

export interface SensorSchema {
  /** Unique stable identifier for this sensor instance */
  id: string;
  /** Human-readable name (e.g., "Geiger Counter") */
  name: string;
  /** Primitive type of the sensor output */
  data_type: 'boolean' | 'float' | 'integer' | 'string' | 'json';
  /** Physical or semantic unit (e.g., "Celsius", "Sieverts", "meters", "text") */
  unit: string;
  /** Operating range for anomaly detection */
  expected_range: { min: number; max: number } | { values: string[] };
  /** Optional human-readable description */
  description?: string;
}

// ---------------------------------------------------------------------------
// Registry storage
// ---------------------------------------------------------------------------
const registry = new Map<string, SensorSchema>();

/**
 * Register a sensor schema at runtime.
 *
 * Stores the schema and returns a Signal with event: "NEW_SENSOR_DETECTED"
 * for alive-runtime to route. The signal should be injected into the normal
 * signal pipeline so alive-mind can evaluate and deduce sensor utility.
 */
export function registerSensor(schema: SensorSchema): Signal {
  if (registry.has(schema.id)) {
    console.warn(`[sensor-registry] Sensor "${schema.id}" already registered. Skipping.`);
  } else {
    registry.set(schema.id, schema);
    console.log(`[sensor-registry] Registered sensor: ${schema.name} (unit: ${schema.unit})`);
  }

  // Emit a NEW_SENSOR_DETECTED signal for alive-mind to evaluate
  return makeSignal({
    id: crypto.randomUUID(),
    source: 'system_api',
    kind: 'system_startup',
    raw_content: {
      event: 'NEW_SENSOR_DETECTED',
      schema,
    },
    payload: {
      event: 'NEW_SENSOR_DETECTED',
      schema,
    },
    timestamp: Date.now(),
    urgency: 0.3,
    confidence: 0.95,
    quality_score: 0.95,
    threat_flag: false,
    firewall_status: 'cleared',
  });
}

/** Look up a registered sensor schema by id. */
export function getSensorSchema(id: string): SensorSchema | undefined {
  return registry.get(id);
}

/** Return all currently registered sensors. */
export function listRegisteredSensors(): readonly SensorSchema[] {
  return Array.from(registry.values());
}
