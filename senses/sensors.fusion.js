/**
 * ALIVE Sensor Fusion
 * 
 * Combine camera + radar + lidar + more into unified understanding.
 * 
 * Human brains don't store or process a lot because they're efficient
 * in forgetting the noise. ALIVE should too.
 * 
 * Body FILTERS (99% noise reduction)
 * Core DECIDES (on the 1% that matters)
 */

export const SensorFusion = {

  // Fusion modes
  modes: {
    emergency: { latency: 10, sensors: ['lidar', 'radar'], fusion: 'fast' },
    navigation: { latency: 100, sensors: ['camera', 'lidar', 'gps'], fusion: 'normal' },
    survey: { latency: 500, sensors: 'all', fusion: 'deep' }
  },

  // Object tracking
  trackedObjects: new Map(),

  // === MAIN FUSION ===
  fuse: function(readings, mode = 'navigation') {
    const config = this.modes[mode] || this.modes.navigation;
    
    // 1. Filter noise from each sensor
    const filtered = this._filterNoise(readings);

    // 2. Align timestamps
    const aligned = this._alignTimestamps(filtered);

    // 3. Detect objects in each sensor
    const detections = this._detectObjects(aligned);

    // 4. Fuse detections across sensors
    const fused = this._fuseDetections(detections);

    // 5. Update tracking
    const tracked = this._updateTracking(fused);

    // 6. Extract only what matters (kill 99% noise)
    const significant = this._extractSignificant(tracked);

    return {
      timestamp: Date.now(),
      mode,
      objects: significant,
      confidence: this._overallConfidence(significant),
      raw_count: Object.keys(readings).length,
      fused_count: significant.length
    };
  },

  // === NOISE FILTERING ===
  _filterNoise: function(readings) {
    const filtered = {};

    for (const [sensor, data] of Object.entries(readings)) {
      switch (sensor) {
        case 'camera':
          filtered.camera = this._filterCamera(data);
          break;
        case 'lidar':
          filtered.lidar = this._filterLidar(data);
          break;
        case 'radar':
          filtered.radar = this._filterRadar(data);
          break;
        case 'ultrasonic':
          filtered.ultrasonic = this._filterUltrasonic(data);
          break;
        case 'gps':
          filtered.gps = this._filterGPS(data);
          break;
        case 'imu':
          filtered.imu = this._filterIMU(data);
          break;
        default:
          filtered[sensor] = data; // Pass through unknown sensors
      }
    }

    return filtered;
  },

  _filterCamera: function(data) {
    // Remove frames with low contrast, blur, overexposure
    if (!data || !data.frame) return null;
    
    return {
      ...data,
      filtered: true,
      quality: data.quality || 0.8
    };
  },

  _filterLidar: function(data) {
    // Remove points that are too close (reflections) or too far (noise)
    if (!data || !data.points) return null;

    const minRange = 0.5; // meters
    const maxRange = 100; // meters

    const validPoints = data.points.filter(p => 
      p.distance >= minRange && p.distance <= maxRange
    );

    return {
      points: validPoints,
      filtered: true,
      reduction: 1 - (validPoints.length / data.points.length)
    };
  },

  _filterRadar: function(data) {
    // Remove stationary clutter, keep moving objects
    if (!data || !data.targets) return null;

    const movingTargets = data.targets.filter(t => 
      Math.abs(t.velocity) > 0.5 // m/s
    );

    return {
      targets: movingTargets,
      filtered: true,
      clutter_removed: data.targets.length - movingTargets.length
    };
  },

  _filterUltrasonic: function(data) {
    // Simple range check
    if (!data) return null;
    
    if (data.distance < 0.02 || data.distance > 5) {
      return null; // Out of valid range
    }

    return { ...data, filtered: true };
  },

  _filterGPS: function(data) {
    // Check for valid fix and reasonable accuracy
    if (!data || !data.fix) return null;
    
    if (data.accuracy > 50) { // meters
      return { ...data, filtered: true, quality: 'low' };
    }

    return { ...data, filtered: true, quality: 'good' };
  },

  _filterIMU: function(data) {
    // Check for sensor saturation
    if (!data) return null;

    const maxAccel = 16; // g
    const maxGyro = 2000; // deg/s

    if (Math.abs(data.accel?.x) > maxAccel || 
        Math.abs(data.accel?.y) > maxAccel ||
        Math.abs(data.accel?.z) > maxAccel) {
      return { ...data, filtered: true, saturated: true };
    }

    return { ...data, filtered: true, saturated: false };
  },

  // === TIMESTAMP ALIGNMENT ===
  _alignTimestamps: function(readings) {
    const now = Date.now();
    const maxAge = 200; // ms

    const aligned = {};
    for (const [sensor, data] of Object.entries(readings)) {
      if (data && (now - (data.timestamp || now)) < maxAge) {
        aligned[sensor] = data;
      }
    }

    return aligned;
  },

  // === OBJECT DETECTION ===
  _detectObjects: function(readings) {
    const detections = [];

    // Camera detections
    if (readings.camera) {
      // Placeholder - would use ML model
      detections.push(...(readings.camera.objects || []));
    }

    // Lidar detections (clustering)
    if (readings.lidar && readings.lidar.points) {
      const clusters = this._clusterLidarPoints(readings.lidar.points);
      detections.push(...clusters.map(c => ({
        source: 'lidar',
        position: c.centroid,
        size: c.size,
        confidence: 0.8
      })));
    }

    // Radar detections
    if (readings.radar && readings.radar.targets) {
      detections.push(...readings.radar.targets.map(t => ({
        source: 'radar',
        position: t.position,
        velocity: t.velocity,
        confidence: 0.7
      })));
    }

    return detections;
  },

  _clusterLidarPoints: function(points) {
    // Simple clustering placeholder
    // Would use DBSCAN or similar in production
    return [];
  },

  // === DETECTION FUSION ===
  _fuseDetections: function(detections) {
    const fused = [];
    const used = new Set();

    for (let i = 0; i < detections.length; i++) {
      if (used.has(i)) continue;

      const cluster = [detections[i]];
      used.add(i);

      // Find nearby detections from different sensors
      for (let j = i + 1; j < detections.length; j++) {
        if (used.has(j)) continue;
        
        if (this._areClose(detections[i], detections[j]) &&
            detections[i].source !== detections[j].source) {
          cluster.push(detections[j]);
          used.add(j);
        }
      }

      // Fuse cluster into single object
      fused.push(this._mergeCluster(cluster));
    }

    return fused;
  },

  _areClose: function(a, b) {
    if (!a.position || !b.position) return false;
    
    const dx = (a.position.x || 0) - (b.position.x || 0);
    const dy = (a.position.y || 0) - (b.position.y || 0);
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    return dist < 2; // meters
  },

  _mergeCluster: function(cluster) {
    if (cluster.length === 1) return cluster[0];

    // Weighted average of positions
    let totalWeight = 0;
    let x = 0, y = 0, z = 0;
    const sources = [];

    for (const det of cluster) {
      const weight = det.confidence || 0.5;
      totalWeight += weight;
      x += (det.position?.x || 0) * weight;
      y += (det.position?.y || 0) * weight;
      z += (det.position?.z || 0) * weight;
      sources.push(det.source);
    }

    return {
      position: { x: x / totalWeight, y: y / totalWeight, z: z / totalWeight },
      confidence: Math.min(1, totalWeight / cluster.length + 0.1 * cluster.length),
      sources: [...new Set(sources)],
      velocity: cluster.find(c => c.velocity)?.velocity
    };
  },

  // === TRACKING ===
  _updateTracking: function(fused) {
    const now = Date.now();
    const maxAge = 2000; // ms

    // Match fused objects to existing tracks
    for (const obj of fused) {
      const matchedTrack = this._findMatchingTrack(obj);
      
      if (matchedTrack) {
        // Update existing track
        matchedTrack.lastSeen = now;
        matchedTrack.position = obj.position;
        matchedTrack.velocity = obj.velocity || matchedTrack.velocity;
        matchedTrack.confidence = Math.min(1, matchedTrack.confidence + 0.05);
        matchedTrack.history.push({ position: obj.position, time: now });
        if (matchedTrack.history.length > 10) matchedTrack.history.shift();
      } else {
        // Create new track
        const trackId = `track_${now}_${Math.random().toString(36).substr(2, 9)}`;
        this.trackedObjects.set(trackId, {
          id: trackId,
          position: obj.position,
          velocity: obj.velocity,
          confidence: obj.confidence,
          firstSeen: now,
          lastSeen: now,
          sources: obj.sources,
          history: [{ position: obj.position, time: now }]
        });
      }
    }

    // Remove stale tracks
    for (const [id, track] of this.trackedObjects) {
      if (now - track.lastSeen > maxAge) {
        this.trackedObjects.delete(id);
      }
    }

    return Array.from(this.trackedObjects.values());
  },

  _findMatchingTrack: function(obj) {
    for (const track of this.trackedObjects.values()) {
      if (this._areClose({ position: track.position }, obj)) {
        return track;
      }
    }
    return null;
  },

  // === SIGNIFICANCE FILTER ===
  _extractSignificant: function(tracked) {
    // Keep only objects that matter
    return tracked.filter(obj => {
      // High confidence
      if (obj.confidence > 0.7) return true;
      
      // Moving
      if (obj.velocity && Math.abs(obj.velocity) > 1) return true;
      
      // Close
      const dist = Math.sqrt(
        (obj.position?.x || 0) ** 2 + 
        (obj.position?.y || 0) ** 2
      );
      if (dist < 10) return true;

      // Been tracked for a while (probably real)
      if (obj.history && obj.history.length > 5) return true;

      return false;
    });
  },

  _overallConfidence: function(objects) {
    if (objects.length === 0) return 0;
    return objects.reduce((sum, o) => sum + o.confidence, 0) / objects.length;
  },

  // === UTILITIES ===
  
  // Clear all tracks
  reset: function() {
    this.trackedObjects.clear();
  },

  // Get current track count
  getTrackCount: function() {
    return this.trackedObjects.size;
  }
};

export default SensorFusion;
