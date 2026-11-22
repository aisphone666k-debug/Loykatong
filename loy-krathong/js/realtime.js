/**
 * ⚡ Realtime Engine for Couple Loy Krathong (Worldwide & Cross-Country Edition)
 * Engineered for Long-Distance Relationships (LDR) across different countries!
 * 
 * Multi-layer sync:
 * 1. Global Cloud MQTT Relay (wss://broker.emqx.io & wss://broker.hivemq.com) - Firewall-proof, works across all countries and 4G/5G mobile carriers
 * 2. PeerJS WebRTC P2P with global STUN servers
 * 3. Local BroadcastChannel for instant local testing
 */

class LoyKrathongRealtime {
  constructor() {
    this.peer = null;
    this.conn = null;
    this.mqttClient = null;
    this.roomId = null;
    this.isHost = false;
    this.isConnected = false;
    this.partnerJoined = false;
    this.broadcastChannel = null;
    this.clientId = 'user_' + Math.random().toString(36).substring(2, 9);
    this.processedMsgIds = new Set();

    // Callbacks
    this.onPartnerConnected = null;
    this.onPartnerStatus = null;
    this.onPartnerKrathong = null;
    this.onPartnerReadyChange = null;
    this.onCountdownStart = null;
    this.onPartnerReaction = null;
    this.onPartnerChat = null;
    this.onFloatTogether = null;
    this.onStatusChange = null;
  }

  // Generate a cute room ID like "LOVE-7842"
  generateRoomId() {
    const num = Math.floor(1000 + Math.random() * 9000);
    return `LOVE-${num}`;
  }

  // --- HOST: CREATE ROOM ---
  createRoom(customRoomId = null) {
    this.isHost = true;
    this.roomId = (customRoomId || this.generateRoomId()).trim().toUpperCase();
    this.initAllChannels();
    return this.roomId;
  }

  // --- GUEST: JOIN ROOM ---
  joinRoom(roomId) {
    this.isHost = false;
    this.roomId = roomId.trim().toUpperCase();
    this.initAllChannels();
  }

  initAllChannels() {
    this.partnerJoined = false;
    try {
      this.initBroadcastChannel();
    } catch (e) {
      console.warn('BroadcastChannel error:', e);
    }
    try {
      this.initCloudMqttRelay();
    } catch (e) {
      console.warn('MQTT error:', e);
    }
    try {
      this.initPeer();
    } catch (e) {
      console.warn('Peer error:', e);
    }
  }

  // --- 1. GLOBAL CLOUD MQTT RELAY (Crucial for Cross-Country LDR) ---
  initCloudMqttRelay() {
    if (typeof mqtt === 'undefined') {
      console.warn('[CloudRelay] MQTT library not available, using WebRTC only.');
      return;
    }

    try {
      // Connect to secure WebSocket MQTT broker
      const brokerUrl = 'wss://broker.emqx.io:8084/mqtt';
      console.log('[CloudRelay] Connecting to Global Cloud Broker for room:', this.roomId);

      this.mqttClient = mqtt.connect(brokerUrl, {
        clientId: `loy_${this.clientId}`,
        clean: true,
        connectTimeout: 8000,
        reconnectPeriod: 3000
      });

      const topic = `loykrathong/couple/room/${this.roomId}`;

      this.mqttClient.on('connect', () => {
        console.log('[CloudRelay] Connected to Global Cloud Relay! Subscribing to:', topic);
        this.mqttClient.subscribe(topic, { qos: 1 });
        
        // Announce presence
        this.send({
          type: 'HANDSHAKE',
          sender: this.isHost ? 'host' : 'guest',
          timestamp: Date.now()
        });
      });

      this.mqttClient.on('message', (t, message) => {
        try {
          const data = JSON.parse(message.toString());
          this.handleIncomingData(data, 'mqtt');
        } catch (e) {
          console.warn('[CloudRelay] Parse error:', e);
        }
      });

      this.mqttClient.on('error', (err) => {
        console.warn('[CloudRelay] MQTT connection warning:', err);
      });
    } catch (e) {
      console.warn('[CloudRelay] Error initializing MQTT:', e);
    }
  }

  // --- 2. LOCAL BROADCAST CHANNEL ---
  initBroadcastChannel() {
    if ('BroadcastChannel' in window) {
      try {
        this.broadcastChannel = new BroadcastChannel(`loy_krathong_${this.roomId}`);
        this.broadcastChannel.onmessage = (event) => {
          this.handleIncomingData(event.data, 'broadcast');
        };
      } catch (e) {
        console.warn('BroadcastChannel not supported:', e);
      }
    }
  }

  // --- 3. PEERJS WEBRTC WITH GLOBAL STUN SERVERS ---
  initPeer() {
    if (typeof Peer === 'undefined') return;

    const peerId = this.isHost 
      ? `loy-krathong-${this.roomId.toLowerCase()}-host`
      : `loy-krathong-${this.roomId.toLowerCase()}-guest-${Math.floor(Math.random() * 10000)}`;

    try {
      this.peer = new Peer(peerId, {
        debug: 1,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
            { urls: 'stun:stun.cloudflare.com:3478' }
          ]
        }
      });

      this.peer.on('open', (id) => {
        console.log('[PeerJS] Ready with ID:', id);
        if (!this.isHost) {
          const hostId = `loy-krathong-${this.roomId.toLowerCase()}-host`;
          this.conn = this.peer.connect(hostId, { reliable: true });
          this.setupConnectionHandlers();
        }
      });

      this.peer.on('connection', (connection) => {
        console.log('[PeerJS] Incoming connection from partner!');
        this.conn = connection;
        this.setupConnectionHandlers();
      });

      this.peer.on('error', (err) => {
        console.warn('[PeerJS] Notice:', err.type);
      });
    } catch (e) {
      console.warn('[PeerJS] Init error:', e);
    }
  }

  setupConnectionHandlers() {
    if (!this.conn) return;

    this.conn.on('open', () => {
      console.log('[PeerJS] Connected to partner DataChannel!');
      this.triggerPartnerConnected();

      this.send({
        type: 'HANDSHAKE',
        sender: this.isHost ? 'host' : 'guest',
        timestamp: Date.now()
      });
    });

    this.conn.on('data', (data) => {
      this.handleIncomingData(data, 'webrtc');
    });

    this.conn.on('close', () => {
      console.log('[PeerJS] Partner disconnected');
    });
  }

  // --- SEND DATA TO PARTNER ---
  send(payload) {
    // Generate unique message ID to prevent duplicate handling
    const msgId = `${this.clientId}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    payload.msgId = msgId;
    payload.roomId = this.roomId;
    payload.senderId = this.isHost ? 'host' : 'guest';
    payload.fromClient = this.clientId;

    // Track own sent messages
    this.processedMsgIds.add(msgId);

    // 1. Send via Global Cloud MQTT (Cross-Country Guaranteed Delivery)
    if (this.mqttClient && this.mqttClient.connected) {
      try {
        const topic = `loykrathong/couple/room/${this.roomId}`;
        this.mqttClient.publish(topic, JSON.stringify(payload), { qos: 1 });
      } catch (e) {
        console.warn('MQTT publish error:', e);
      }
    }

    // 2. Send via WebRTC DataChannel (Ultra-low latency P2P)
    if (this.conn && this.conn.open) {
      try {
        this.conn.send(payload);
      } catch (e) {
        console.warn('WebRTC send error:', e);
      }
    }

    // 3. Send via BroadcastChannel (Same machine multi-tab)
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage(payload);
      } catch (e) {
        console.warn('BroadcastChannel send error:', e);
      }
    }
  }

  triggerPartnerConnected(data) {
    this.isConnected = true;
    if (!this.partnerJoined) {
      this.partnerJoined = true;
      if (this.onPartnerConnected) {
        this.onPartnerConnected(data);
      }
    }
  }

  // --- HANDLE INCOMING DATA WITH DEDUPLICATION ---
  handleIncomingData(data, source) {
    if (!data || !data.type) return;

    // Ignore self-messages
    if (data.fromClient === this.clientId) return;

    // Deduplicate (since message may arrive via both MQTT and WebRTC)
    if (data.msgId) {
      if (this.processedMsgIds.has(data.msgId)) return;
      this.processedMsgIds.add(data.msgId);
      // Keep set bounded
      if (this.processedMsgIds.size > 200) {
        const first = this.processedMsgIds.values().next().value;
        this.processedMsgIds.delete(first);
      }
    }

    // Connected flag (guaranteed single trigger)
    this.triggerPartnerConnected(data);

    switch (data.type) {
      case 'HANDSHAKE':
        // Reply with handshake so guest knows host is here
        if (this.isHost && data.sender === 'guest') {
          this.send({ type: 'HANDSHAKE_ACK', sender: 'host' });
        }
        break;

      case 'HANDSHAKE_ACK':
        break;

      case 'STATUS_UPDATE':
        if (this.onPartnerStatus) this.onPartnerStatus(data.status, data);
        break;

      case 'KRATHONG_SYNC':
        if (this.onPartnerKrathong) this.onPartnerKrathong(data.config);
        break;

      case 'READY_CHANGE':
        if (this.onPartnerReadyChange) this.onPartnerReadyChange(data.isReady, data.config);
        break;

      case 'COUNTDOWN_START':
        if (this.onCountdownStart) this.onCountdownStart(data.startTimestamp);
        break;

      case 'FLOAT_TOGETHER':
        if (this.onFloatTogether) this.onFloatTogether(data);
        break;

      case 'REACTION':
        if (this.onPartnerReaction) this.onPartnerReaction(data.reactionType, data);
        break;

      case 'LOVE_CHAT':
        if (this.onPartnerChat) this.onPartnerChat(data.message, data.senderName);
        break;
    }
  }

  // Public helper emitters
  sendStatus(status, meta = {}) {
    this.send({ type: 'STATUS_UPDATE', status, ...meta });
  }

  sendKrathongConfig(config) {
    this.send({ type: 'KRATHONG_SYNC', config });
  }

  sendReadyChange(isReady, config) {
    this.send({ type: 'READY_CHANGE', isReady, config });
  }

  sendCountdownStart(startTimestamp) {
    this.send({ type: 'COUNTDOWN_START', startTimestamp: startTimestamp || Date.now() });
  }

  sendFloatTrigger(myConfig) {
    this.send({ type: 'FLOAT_TOGETHER', config: myConfig, timestamp: Date.now() });
  }

  sendReaction(reactionType, meta = {}) {
    this.send({ type: 'REACTION', reactionType, ...meta });
  }

  sendChat(message, senderName) {
    this.send({ type: 'LOVE_CHAT', message, senderName });
  }
}

window.realtimeEngine = new LoyKrathongRealtime();
