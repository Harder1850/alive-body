/**
 * ALIVE Swarm Protocol
 * 
 * Communication between ALIVE instances (vehicles, drones, stations).
 * Share hazards, discoveries, status with the swarm.
 * 
 * Human brains don't need to store or process a lot because they
 * communicate with other people. ALIVE should too.
 */

export const SwarmProtocol = {

  // Local identity
  identity: null,

  // Known peers
  peers: new Map(),

  // Message queue
  outbox: [],
  inbox: [],

  // Handlers
  handlers: new Map(),

  // === INITIALIZATION ===

  init: function(config) {
    this.identity = {
      id: config.id || `alive_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
      type: config.type || 'unknown', // vehicle, drone, station, phone
      capabilities: config.capabilities || [],
      position: config.position || null,
      status: 'online'
    };

    console.log(`[Swarm] Initialized as ${this.identity.id} (${this.identity.type})`);
    return this.identity;
  },

  // === MESSAGE TYPES ===

  messageTypes: {
    // Discovery
    ANNOUNCE: 'announce',     // "I'm here"
    QUERY: 'query',           // "Who's there?"
    
    // Hazards
    HAZARD: 'hazard',         // "Danger at location X"
    HAZARD_CLEAR: 'hazard_clear', // "Hazard X is gone"
    
    // Navigation
    PATH_FOUND: 'path_found', // "Found route to X"
    PATH_BLOCKED: 'path_blocked', // "Route to X blocked"
    
    // Assistance
    HELP_REQUEST: 'help_request', // "Need help with X"
    HELP_OFFER: 'help_offer', // "I can help with X"
    
    // Status
    STATUS: 'status',         // "My current state"
    HEARTBEAT: 'heartbeat',   // "I'm still alive"
    
    // Knowledge
    KNOWLEDGE_SHARE: 'knowledge_share', // "Learned something useful"
    KNOWLEDGE_REQUEST: 'knowledge_request' // "Anyone know about X?"
  },

  // === SENDING ===

  // Broadcast to all peers
  broadcast: function(type, payload) {
    const message = this._createMessage(type, payload, null);
    this.outbox.push(message);
    return message.id;
  },

  // Send to specific peer
  send: function(peerId, type, payload) {
    const message = this._createMessage(type, payload, peerId);
    this.outbox.push(message);
    return message.id;
  },

  // Report a hazard
  reportHazard: function(hazard) {
    return this.broadcast(this.messageTypes.HAZARD, {
      hazardType: hazard.type, // obstacle, weather, hostile, terrain
      severity: hazard.severity, // 0-1
      position: hazard.position,
      description: hazard.description,
      expiry: hazard.expiry || Date.now() + 3600000, // 1 hour default
      confidence: hazard.confidence || 0.7
    });
  },

  // Share discovered path
  sharePath: function(path) {
    return this.broadcast(this.messageTypes.PATH_FOUND, {
      from: path.from,
      to: path.to,
      waypoints: path.waypoints,
      conditions: path.conditions,
      timestamp: Date.now()
    });
  },

  // Request help
  requestHelp: function(need) {
    return this.broadcast(this.messageTypes.HELP_REQUEST, {
      needType: need.type, // tow, fuel, directions, escort
      urgency: need.urgency, // 0-1
      position: this.identity.position,
      description: need.description
    });
  },

  // Offer help
  offerHelp: function(peerId, capability) {
    return this.send(peerId, this.messageTypes.HELP_OFFER, {
      canHelp: capability.type,
      eta: capability.eta,
      conditions: capability.conditions
    });
  },

  // Share knowledge
  shareKnowledge: function(knowledge) {
    return this.broadcast(this.messageTypes.KNOWLEDGE_SHARE, {
      topic: knowledge.topic,
      content: knowledge.content,
      confidence: knowledge.confidence,
      source: 'experience'
    });
  },

  // Request knowledge
  requestKnowledge: function(topic) {
    return this.broadcast(this.messageTypes.KNOWLEDGE_REQUEST, {
      topic,
      context: this.identity.position
    });
  },

  // === RECEIVING ===

  // Process incoming message
  receive: function(rawMessage) {
    const message = this._parseMessage(rawMessage);
    if (!message) return null;

    // Update peer info
    this._updatePeer(message.from);

    // Add to inbox
    this.inbox.push(message);

    // Call handler if registered
    const handler = this.handlers.get(message.type);
    if (handler) {
      handler(message);
    }

    return message;
  },

  // Register message handler
  on: function(messageType, handler) {
    this.handlers.set(messageType, handler);
  },

  // Get pending messages from inbox
  getMessages: function(type = null) {
    if (type) {
      return this.inbox.filter(m => m.type === type);
    }
    return [...this.inbox];
  },

  // Clear processed messages
  clearInbox: function() {
    this.inbox = [];
  },

  // === PEER MANAGEMENT ===

  // Get known peers
  getPeers: function() {
    return Array.from(this.peers.values());
  },

  // Get nearby peers
  getNearbyPeers: function(radius = 1000) {
    if (!this.identity.position) return [];

    return this.getPeers().filter(peer => {
      if (!peer.position) return false;
      
      const dx = peer.position.x - this.identity.position.x;
      const dy = peer.position.y - this.identity.position.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      return dist <= radius;
    });
  },

  // Update own position
  updatePosition: function(position) {
    this.identity.position = position;
    
    // Broadcast updated position periodically
    this.broadcast(this.messageTypes.STATUS, {
      position,
      status: this.identity.status
    });
  },

  // === DISCOVERY ===

  // Announce presence
  announce: function() {
    return this.broadcast(this.messageTypes.ANNOUNCE, {
      type: this.identity.type,
      capabilities: this.identity.capabilities,
      position: this.identity.position
    });
  },

  // Query for peers
  queryPeers: function() {
    return this.broadcast(this.messageTypes.QUERY, {
      seeking: 'all',
      position: this.identity.position
    });
  },

  // === HAZARD AGGREGATION ===

  // Get all known hazards
  getKnownHazards: function() {
    const hazards = [];
    const now = Date.now();

    for (const msg of this.inbox) {
      if (msg.type === this.messageTypes.HAZARD) {
        // Check if not expired
        if (msg.payload.expiry > now) {
          hazards.push({
            ...msg.payload,
            reportedBy: msg.from,
            reportedAt: msg.timestamp
          });
        }
      }
    }

    // Also filter out cleared hazards
    const cleared = new Set();
    for (const msg of this.inbox) {
      if (msg.type === this.messageTypes.HAZARD_CLEAR) {
        cleared.add(msg.payload.hazardId);
      }
    }

    return hazards.filter(h => !cleared.has(h.id));
  },

  // === INTERNAL ===

  _createMessage: function(type, payload, to) {
    return {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
      type,
      from: this.identity.id,
      to: to, // null for broadcast
      payload,
      timestamp: Date.now(),
      ttl: 5 // hops
    };
  },

  _parseMessage: function(raw) {
    try {
      const message = typeof raw === 'string' ? JSON.parse(raw) : raw;
      
      // Validate required fields
      if (!message.id || !message.type || !message.from) {
        return null;
      }

      // Ignore own messages
      if (message.from === this.identity?.id) {
        return null;
      }

      // Check TTL
      if (message.ttl <= 0) {
        return null;
      }

      return message;
    } catch (e) {
      return null;
    }
  },

  _updatePeer: function(peerId) {
    const existing = this.peers.get(peerId);
    
    if (existing) {
      existing.lastSeen = Date.now();
    } else {
      this.peers.set(peerId, {
        id: peerId,
        firstSeen: Date.now(),
        lastSeen: Date.now(),
        position: null,
        type: null,
        status: 'unknown'
      });
    }
  },

  // === FLUSH OUTBOX ===
  // Returns messages to be sent and clears outbox
  flush: function() {
    const messages = [...this.outbox];
    this.outbox = [];
    return messages;
  },

  // === STATUS ===
  getStatus: function() {
    return {
      identity: this.identity,
      peerCount: this.peers.size,
      inboxCount: this.inbox.length,
      outboxCount: this.outbox.length,
      knownHazards: this.getKnownHazards().length
    };
  },

  // === RESET ===
  reset: function() {
    this.peers.clear();
    this.inbox = [];
    this.outbox = [];
    this.handlers.clear();
  }
};

export default SwarmProtocol;
