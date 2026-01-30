/**
 * ALIVE Hardware Abstraction Layer (HAL)
 * 
 * Same brain, different bodies.
 * ALIVE adapts to: phone, laptop, vehicle, robot, drone, spaceship.
 * 
 * Body may ACT but not DECIDE.
 * Brain may DECIDE but not ACT.
 */

export const HAL = {

  // Current host profile
  host: null,

  // Host type definitions
  hostTypes: {
    phone: {
      sensors: ['camera', 'microphone', 'gps', 'accelerometer', 'gyroscope'],
      actuators: ['screen', 'speaker', 'vibration'],
      resources: { compute: 'low', memory: 'low', storage: 'medium', battery: 'limited' },
      network: ['wifi', 'cellular']
    },
    laptop: {
      sensors: ['camera', 'microphone'],
      actuators: ['screen', 'speaker'],
      resources: { compute: 'medium', memory: 'medium', storage: 'high', battery: 'limited' },
      network: ['wifi', 'ethernet']
    },
    vehicle: {
      sensors: ['camera', 'radar', 'lidar', 'gps', 'imu', 'ultrasonic', 'wheel_encoder'],
      actuators: ['steering', 'throttle', 'brake', 'lights', 'horn', 'display', 'speaker'],
      resources: { compute: 'high', memory: 'high', storage: 'high', battery: 'vehicle' },
      network: ['cellular', 'v2x', 'wifi']
    },
    robot: {
      sensors: ['camera', 'lidar', 'imu', 'touch', 'force', 'proximity'],
      actuators: ['motors', 'grippers', 'speaker', 'display'],
      resources: { compute: 'medium', memory: 'medium', storage: 'medium', battery: 'limited' },
      network: ['wifi', 'bluetooth']
    },
    drone: {
      sensors: ['camera', 'imu', 'gps', 'barometer', 'ultrasonic'],
      actuators: ['rotors', 'gimbal', 'lights'],
      resources: { compute: 'low', memory: 'low', storage: 'low', battery: 'critical' },
      network: ['radio', 'wifi']
    },
    station: {
      sensors: ['camera', 'microphone', 'environmental'],
      actuators: ['display', 'speaker', 'relay'],
      resources: { compute: 'high', memory: 'high', storage: 'high', battery: 'unlimited' },
      network: ['ethernet', 'wifi', 'cellular']
    }
  },

  // === INITIALIZATION ===
  init: function(hostType, capabilities = {}) {
    const template = this.hostTypes[hostType];
    if (!template) {
      throw new Error(`HAL: Unknown host type: ${hostType}`);
    }

    this.host = {
      type: hostType,
      sensors: this._initSensors(template.sensors, capabilities.sensors),
      actuators: this._initActuators(template.actuators, capabilities.actuators),
      resources: { ...template.resources, ...capabilities.resources },
      network: template.network,
      initialized: Date.now()
    };

    console.log(`[HAL] Initialized as ${hostType}`);
    return this.host;
  },

  // === SENSOR ACCESS ===
  
  // Check if sensor available
  hasSensor: function(sensorType) {
    return this.host?.sensors?.some(s => s.type === sensorType && s.available);
  },

  // Read from sensor (single shot)
  readSensor: async function(sensorType) {
    if (!this.hasSensor(sensorType)) {
      return { error: 'sensor_unavailable', type: sensorType };
    }

    const sensor = this.host.sensors.find(s => s.type === sensorType);
    
    // Call the sensor's read function
    if (sensor.read) {
      return await sensor.read();
    }

    return { error: 'sensor_no_read_function', type: sensorType };
  },

  // Read all available sensors
  readAllSensors: async function() {
    const readings = {};
    
    for (const sensor of this.host.sensors) {
      if (sensor.available && sensor.read) {
        readings[sensor.type] = await sensor.read();
      }
    }

    return {
      timestamp: Date.now(),
      readings
    };
  },

  // === ACTUATOR ACCESS ===

  // Check if actuator available
  hasActuator: function(actuatorType) {
    return this.host?.actuators?.some(a => a.type === actuatorType && a.available);
  },

  // Command actuator (single action)
  commandActuator: async function(actuatorType, command) {
    if (!this.hasActuator(actuatorType)) {
      return { error: 'actuator_unavailable', type: actuatorType };
    }

    const actuator = this.host.actuators.find(a => a.type === actuatorType);

    // Validate command is within limits
    if (!this._validateCommand(actuator, command)) {
      return { error: 'command_out_of_limits', type: actuatorType, command };
    }

    // Execute command
    if (actuator.execute) {
      return await actuator.execute(command);
    }

    return { error: 'actuator_no_execute_function', type: actuatorType };
  },

  // === RESOURCE MONITORING ===

  getResources: function() {
    return {
      compute: this._checkCompute(),
      memory: this._checkMemory(),
      storage: this._checkStorage(),
      battery: this._checkBattery(),
      network: this._checkNetwork()
    };
  },

  // === CAPABILITY QUERY ===

  getCapabilities: function() {
    return {
      hostType: this.host?.type,
      sensors: this.host?.sensors?.map(s => ({ type: s.type, available: s.available })),
      actuators: this.host?.actuators?.map(a => ({ type: a.type, available: a.available })),
      resources: this.host?.resources,
      network: this.host?.network
    };
  },

  // Can this body do X?
  canDo: function(action) {
    switch (action) {
      case 'move':
        return this.hasActuator('steering') || this.hasActuator('motors') || this.hasActuator('rotors');
      case 'see':
        return this.hasSensor('camera') || this.hasSensor('lidar');
      case 'hear':
        return this.hasSensor('microphone');
      case 'speak':
        return this.hasActuator('speaker');
      case 'locate':
        return this.hasSensor('gps') || this.hasSensor('imu');
      case 'communicate':
        return this.host?.network?.length > 0;
      default:
        return false;
    }
  },

  // === INTERNAL ===

  _initSensors: function(sensorTypes, overrides = {}) {
    return sensorTypes.map(type => ({
      type,
      available: overrides[type]?.available !== false,
      read: overrides[type]?.read || null,
      calibration: overrides[type]?.calibration || null
    }));
  },

  _initActuators: function(actuatorTypes, overrides = {}) {
    return actuatorTypes.map(type => ({
      type,
      available: overrides[type]?.available !== false,
      execute: overrides[type]?.execute || null,
      limits: overrides[type]?.limits || null
    }));
  },

  _validateCommand: function(actuator, command) {
    if (!actuator.limits) return true;
    
    // Check command is within defined limits
    for (const [key, value] of Object.entries(command)) {
      if (actuator.limits[key]) {
        if (value < actuator.limits[key].min || value > actuator.limits[key].max) {
          return false;
        }
      }
    }
    return true;
  },

  _checkCompute: function() {
    // Placeholder - would check actual CPU usage
    return { level: this.host?.resources?.compute || 'unknown', usage: 0.5 };
  },

  _checkMemory: function() {
    // Placeholder - would check actual memory
    return { level: this.host?.resources?.memory || 'unknown', usage: 0.4 };
  },

  _checkStorage: function() {
    // Placeholder - would check actual storage
    return { level: this.host?.resources?.storage || 'unknown', usage: 0.3 };
  },

  _checkBattery: function() {
    // Placeholder - would check actual battery
    return { level: this.host?.resources?.battery || 'unknown', percentage: 0.8 };
  },

  _checkNetwork: function() {
    // Placeholder - would check actual network
    return { 
      available: this.host?.network || [],
      connected: this.host?.network?.[0] || null,
      strength: 0.7
    };
  }
};

export default HAL;
