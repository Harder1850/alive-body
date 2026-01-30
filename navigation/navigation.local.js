/**
 * ALIVE Local Navigation
 * 
 * Navigate using signs, landmarks, traffic, sun position.
 * No maps. No GPS. Like humans did for thousands of years.
 * 
 * Spatial Memory: Store relationships between landmarks
 * "From hospital, go west 2 blocks, turn right at church"
 */

export const LocalNavigation = {

  // Landmark memory
  landmarks: new Map(),
  
  // Relationships between landmarks
  relations: [],

  // Current position estimate
  currentPosition: null,
  positionConfidence: 0,

  // === LANDMARK MANAGEMENT ===

  // Add a recognized landmark
  addLandmark: function(landmark) {
    const id = landmark.id || `lm_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    
    this.landmarks.set(id, {
      id,
      type: landmark.type, // building, sign, intersection, natural
      features: landmark.features, // visual descriptors
      position: landmark.position, // estimated world position
      timestamp: Date.now(),
      confidence: landmark.confidence || 0.5,
      sightings: 1
    });

    return id;
  },

  // Update landmark on re-sighting
  updateLandmark: function(id, observation) {
    const lm = this.landmarks.get(id);
    if (!lm) return false;

    lm.sightings++;
    lm.confidence = Math.min(1, lm.confidence + 0.1);
    lm.timestamp = Date.now();
    
    // Update position estimate (weighted average)
    if (observation.position) {
      const w = 0.3; // weight for new observation
      lm.position = {
        x: lm.position.x * (1 - w) + observation.position.x * w,
        y: lm.position.y * (1 - w) + observation.position.y * w
      };
    }

    return true;
  },

  // Store relationship between landmarks
  addRelation: function(from, to, relation) {
    this.relations.push({
      from,
      to,
      direction: relation.direction, // north, east, etc.
      distance: relation.distance, // estimated
      via: relation.via, // "turn right at church"
      instructions: relation.instructions,
      confidence: relation.confidence || 0.5,
      timestamp: Date.now()
    });
  },

  // === LOCALIZATION ===

  // Match current view to known landmarks
  localize: function(sensorData) {
    const matches = [];

    // Try to match visual features to known landmarks
    for (const [id, landmark] of this.landmarks) {
      const matchScore = this._matchFeatures(sensorData.features, landmark.features);
      
      if (matchScore > 0.6) {
        matches.push({
          landmark,
          score: matchScore,
          bearing: sensorData.bearing, // direction to landmark
          distance: sensorData.estimatedDistance
        });
      }
    }

    if (matches.length === 0) {
      return {
        localized: false,
        confidence: 0,
        position: null,
        nearbyLandmarks: []
      };
    }

    // Sort by match quality
    matches.sort((a, b) => b.score - a.score);

    // Estimate position from best matches
    const position = this._triangulate(matches.slice(0, 3));
    
    this.currentPosition = position;
    this.positionConfidence = matches[0].score;

    return {
      localized: true,
      confidence: this.positionConfidence,
      position,
      nearbyLandmarks: matches.slice(0, 5)
    };
  },

  // === PATHFINDING ===

  // Find path from current location to destination
  findPath: function(from, to) {
    // BFS through landmark graph
    const visited = new Set();
    const queue = [{ landmark: from, path: [], instructions: [] }];

    while (queue.length > 0) {
      const current = queue.shift();
      
      if (current.landmark === to) {
        return {
          found: true,
          path: current.path,
          instructions: current.instructions,
          estimatedDistance: this._calculateTotalDistance(current.path)
        };
      }

      if (visited.has(current.landmark)) continue;
      visited.add(current.landmark);

      // Find all relations from current landmark
      const outgoing = this.relations.filter(r => r.from === current.landmark);
      
      for (const rel of outgoing) {
        if (!visited.has(rel.to)) {
          queue.push({
            landmark: rel.to,
            path: [...current.path, rel],
            instructions: [...current.instructions, rel.instructions || rel.via]
          });
        }
      }
    }

    return {
      found: false,
      path: [],
      instructions: [],
      reason: 'no_path_found'
    };
  },

  // === NAVIGATION CUES ===

  // Extract navigation info from visual scene
  extractNavigationCues: function(scene) {
    const cues = [];

    // Signs
    if (scene.signs) {
      for (const sign of scene.signs) {
        cues.push({
          type: 'sign',
          content: sign.text,
          direction: sign.pointing,
          confidence: sign.readability
        });
      }
    }

    // Sun position (time + direction)
    if (scene.sun) {
      const direction = this._sunToDirection(scene.sun.position, scene.time);
      cues.push({
        type: 'sun',
        direction,
        confidence: scene.sun.visible ? 0.8 : 0.3
      });
    }

    // Traffic flow
    if (scene.traffic) {
      cues.push({
        type: 'traffic',
        flowDirection: scene.traffic.direction,
        density: scene.traffic.density,
        confidence: 0.6
      });
    }

    // Terrain slope
    if (scene.terrain) {
      cues.push({
        type: 'terrain',
        slope: scene.terrain.slope,
        direction: scene.terrain.downhill,
        confidence: 0.7
      });
    }

    return cues;
  },

  // Get navigation instruction for current position and goal
  getNextInstruction: function(goal) {
    if (!this.currentPosition) {
      return {
        instruction: 'localize_first',
        action: 'look_for_landmarks'
      };
    }

    // Find path to goal
    const nearestLandmark = this._findNearestLandmark(this.currentPosition);
    if (!nearestLandmark) {
      return {
        instruction: 'explore',
        action: 'move_forward_slowly'
      };
    }

    const path = this.findPath(nearestLandmark.id, goal);
    if (!path.found) {
      return {
        instruction: 'no_known_path',
        action: 'explore_toward_goal',
        direction: this._directionTo(this.currentPosition, goal)
      };
    }

    // Return first step
    const firstStep = path.path[0];
    return {
      instruction: firstStep.instructions || `Go ${firstStep.direction}`,
      action: 'follow_path',
      direction: firstStep.direction,
      distance: firstStep.distance,
      nextLandmark: firstStep.to
    };
  },

  // === INTERNAL HELPERS ===

  _matchFeatures: function(observed, stored) {
    if (!observed || !stored) return 0;
    
    // Simple feature matching placeholder
    // Would use visual feature comparison in production
    let matches = 0;
    let total = 0;

    for (const feature of Object.keys(stored)) {
      total++;
      if (observed[feature] === stored[feature]) {
        matches++;
      }
    }

    return total > 0 ? matches / total : 0;
  },

  _triangulate: function(matches) {
    if (matches.length === 0) return null;
    if (matches.length === 1) {
      // Single landmark - estimate from bearing and distance
      const m = matches[0];
      return {
        x: m.landmark.position.x - Math.cos(m.bearing) * m.distance,
        y: m.landmark.position.y - Math.sin(m.bearing) * m.distance
      };
    }

    // Weighted average for multiple landmarks
    let totalWeight = 0;
    let x = 0, y = 0;

    for (const m of matches) {
      const weight = m.score;
      totalWeight += weight;
      
      const estX = m.landmark.position.x - Math.cos(m.bearing) * m.distance;
      const estY = m.landmark.position.y - Math.sin(m.bearing) * m.distance;
      
      x += estX * weight;
      y += estY * weight;
    }

    return { x: x / totalWeight, y: y / totalWeight };
  },

  _calculateTotalDistance: function(path) {
    return path.reduce((sum, step) => sum + (step.distance || 0), 0);
  },

  _sunToDirection: function(sunPosition, time) {
    // Simplified sun position to compass direction
    // In reality would need latitude and date
    const hour = time.getHours();
    
    if (hour < 12) {
      return sunPosition.azimuth < 180 ? 'east' : 'southeast';
    } else {
      return sunPosition.azimuth < 270 ? 'southwest' : 'west';
    }
  },

  _findNearestLandmark: function(position) {
    let nearest = null;
    let minDist = Infinity;

    for (const landmark of this.landmarks.values()) {
      const dx = landmark.position.x - position.x;
      const dy = landmark.position.y - position.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < minDist) {
        minDist = dist;
        nearest = landmark;
      }
    }

    return nearest;
  },

  _directionTo: function(from, to) {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
    
    if (angle > -22.5 && angle <= 22.5) return 'east';
    if (angle > 22.5 && angle <= 67.5) return 'northeast';
    if (angle > 67.5 && angle <= 112.5) return 'north';
    if (angle > 112.5 && angle <= 157.5) return 'northwest';
    if (angle > 157.5 || angle <= -157.5) return 'west';
    if (angle > -157.5 && angle <= -112.5) return 'southwest';
    if (angle > -112.5 && angle <= -67.5) return 'south';
    return 'southeast';
  },

  // === UTILITIES ===

  reset: function() {
    this.landmarks.clear();
    this.relations = [];
    this.currentPosition = null;
    this.positionConfidence = 0;
  },

  getLandmarkCount: function() {
    return this.landmarks.size;
  },

  getRelationCount: function() {
    return this.relations.length;
  }
};

export default LocalNavigation;
