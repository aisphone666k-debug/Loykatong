/**
 * ⚡ Realtime Engine for Couple Loy Krathong (Worldwide & Cross-Country Edition)
 * Engineered for Long-Distance Relationships (LDR) across different countries!
 *
 * Multi-layer sync:
 * 1. Dual Global Cloud MQTT Relays (EMQX + HiveMQ over Secure WebSockets)
 *    - Active-active redundancy with msgId deduplication
 *    - Works across Thailand, Indonesia, and worldwide mobile 4G/5G carriers
 * 2. PeerJS WebRTC P2P with global STUN servers (low-latency bonus channel)
 * 3. Local BroadcastChannel for instant local multi-tab testing
 * 4. Bidirectional handshake + periodic lightweight STATE_SYNC heartbeat
 *    - Automatically recovers from mobile app switching (LINE/WhatsApp) and packet drops
 */

class LoyKrathongRealtime {
  constructor() {
    this.peer = null;
    this.conn = null;
    this.mqttClients = [];
    this.mqttClient = null; // Backwards-compatible reference to first active client
    this.roomId = null;
    this.isHost = false;
    this.isConnected = false;
    this.cloudConnected = false;
    this.partnerJoined = false;
    this.broadcastChannel = null;
    this.clientId = 'user_' + Math.random().toString(36).substring(2, 9);
    this.processedMsgIds = new Set();

    // Heartbeat & partner state tracking
    this.heartbeatTimer = null;
    this.lastPartnerClientId = null;
    this.lastPartnerReadySeq = -1;
    this.pendingMessages = [];
    this.localStateProvider = null;

    // Multi-broker active-active list for high cross-country reliability
    this.mqttBrokers = [
      'wss://broker.emqx.io:8084/mqtt',
      'wss://broker.hivemq.com:8884/mqtt'
    ];

    // Max single packet bytes for public MQTT brokers (stay well under broker limits)
    this.MAX_MQTT_BYTES = 180 * 1024;

    // Lifecycle listeners for mobile resume (switching back from WhatsApp/LINE)
    this._boundVisibilityHandler = this._handleVisibilityChange.bind(this);
    this._boundOnlineHandler = this._handleOnline.bind(this);
    this._lifecycleBound = false;

    // Callbacks
    this.onPartnerConnected = null;
    this.onPartnerResyncNeeded = null;
    this.onPartnerStatus = null;
    this.onPartnerKrathong = null;
    this.onPartnerReadyChange = null;
    this.onPartnerStateSync = null;
    this.onCountdownStart = null;
    this.onPartnerReaction = null;
    this.onPartnerChat = null;
    this.onFloatTogether = null;
    this.onStatusChange = null;
    this.onCloudStatusChange = null;
  }

  // Register a callback that returns { isReady, readySeq, isCountingDown, screen, myName, partnerName }
  setLocalStateProvider(fn) {
    this.localStateProvider = fn;
  }

  getLocalStateSnapshot() {
    if (typeof this.localStateProvider === 'function') {
      try {
        return this.localStateProvider() || {};
      } catch (e) {
        return {};
      }
    }
    return {};
  }

  // Generate a cute room ID like "LOVE-7842"
  generateRoomId() {
    const num = Math.floor(1000 + Math.random() * 9000);
    return `LOVE-${num}`;
  }

  // --- HOST: CREATE ROOM ---
  createRoom(customRoomId = null) {
    this.disconnect();
    this.isHost = true;
    this.roomId = (customRoomId || this.generateRoomId()).trim().toUpperCase();
    this.initAllChannels();
    return this.roomId;
  }

  // --- GUEST: JOIN ROOM ---
  joinRoom(roomId) {
    this.disconnect();
    this.isHost = false;
    this.roomId = roomId.trim().toUpperCase();
    this.initAllChannels();
  }

  // --- CLEAN DISCONNECT ---
  disconnect() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }

    if (this._lifecycleBound) {
      document.removeEventListener('visibilitychange', this._boundVisibilityHandler);
      window.removeEventListener('online', this._boundOnlineHandler);
      this._lifecycleBound = false;
    }

    // Close all MQTT clients
    this.mqttClients.forEach((client) => {
      try {
        client.end(true);
      } catch (e) {}
    });
    this.mqttClients = [];
    this.mqttClient = null;

    // Close WebRTC PeerJS
    if (this.conn) {
      try {
        this.conn.close();
      } catch (e) {}
      this.conn = null;
    }
    if (this.peer) {
      try {
        this.peer.destroy();
      } catch (e) {}
      this.peer = null;
    }

    // Close BroadcastChannel
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.close();
      } catch (e) {}
      this.broadcastChannel = null;
    }

    this.roomId = null;
    this.isConnected = false;
    this.cloudConnected = false;
    this.partnerJoined = false;
    this.lastPartnerClientId = null;
    this.lastPartnerReadySeq = -1;
    this.pendingMessages = [];
  }

  initAllChannels() {
    this.isConnected = false;
    this.cloudConnected = false;
    this.partnerJoined = false;
    this.lastPartnerClientId = null;
    this.lastPartnerReadySeq = -1;
    this.pendingMessages = [];

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

    this.startHeartbeat();
    this._bindLifecycleEvents();
  }

  _bindLifecycleEvents() {
    if (this._lifecycleBound) return;
    document.addEventListener('visibilitychange', this._boundVisibilityHandler);
    window.addEventListener('online', this._boundOnlineHandler);
    this._lifecycleBound = true;
  }

  _handleVisibilityChange() {
    if (document.visibilityState === 'visible' && this.roomId) {
      this._reconnectAndAnnounce();
    }
  }

  _handleOnline() {
    if (this.roomId) {
      this._reconnectAndAnnounce();
    }
  }

  _reconnectAndAnnounce() {
    // Reconnect any dropped MQTT brokers when returning from WhatsApp/LINE
    this.mqttClients.forEach((client) => {
      if (!client.connected && !client.reconnecting) {
        try {
          client.reconnect();
        } catch (e) {}
      }
    });
    // Re-announce presence & current state
    this.sendHandshake();
    this.sendStateSync();
  }

  _updateCloudStatus() {
    const anyReady = this.mqttClients.some((c) => c.connected && c._subscribed);
    if (anyReady !== this.cloudConnected) {
      this.cloudConnected = anyReady;
      if (this.onCloudStatusChange) {
        this.onCloudStatusChange(anyReady);
      }
    }
  }

  // --- 1. DUAL GLOBAL CLOUD MQTT RELAY (Cross-Country Redundancy) ---
  initCloudMqttRelay() {
    if (typeof mqtt === 'undefined') {
      console.warn('[CloudRelay] MQTT library not available, retrying shortly...');
      // Retry once in case fallback CDN script is still loading
      setTimeout(() => {
        if (this.roomId && this.mqttClients.length === 0 && typeof mqtt !== 'undefined') {
          this.initCloudMqttRelay();
        }
      }, 1500);
      return;
    }

    const activeRoom = this.roomId;
    const topic = `loykrathong/couple/room/${activeRoom}`;

    this.mqttBrokers.forEach((brokerUrl, index) => {
      try {
        console.log(`[CloudRelay #${index + 1}] Connecting to ${brokerUrl} for room:`, activeRoom);

        const client = mqtt.connect(brokerUrl, {
          clientId: `loy_${this.clientId}_${index}_${Math.floor(Math.random() * 1000)}`,
          clean: true,
          connectTimeout: 8000,
          reconnectPeriod: 3000,
          keepalive: 25
        });

        client._brokerUrl = brokerUrl;
        client._subscribed = false;

        client.on('connect', () => {
          if (this.roomId !== activeRoom) {
            try { client.end(true); } catch (e) {}
            return;
          }
          console.log(`[CloudRelay #${index + 1}] Connected! Subscribing to:`, topic);
          // Wait for subscribe ACK BEFORE sending handshake so replies are never missed!
          client.subscribe(topic, { qos: 1 }, (err) => {
            if (err) {
              console.warn(`[CloudRelay #${index + 1}] Subscribe error:`, err);
              return;
            }
            if (this.roomId !== activeRoom) return;
            client._subscribed = true;
            this._updateCloudStatus();
            console.log(`[CloudRelay #${index + 1}] Subscribed! Announcing presence.`);

            // Flush any queued messages sent before broker finished subscribing
            this._flushPendingToClient(client);

            // Announce presence & sync current ready state
            this.sendHandshake();
            this.sendStateSync();
          });
        });

        client.on('message', (t, message) => {
          if (this.roomId !== activeRoom) return;
          try {
            const data = JSON.parse(message.toString());
            this.handleIncomingData(data, `mqtt_${index + 1}`);
          } catch (e) {
            console.warn('[CloudRelay] Parse error:', e);
          }
        });

        client.on('close', () => {
          client._subscribed = false;
          this._updateCloudStatus();
        });

        client.on('offline', () => {
          client._subscribed = false;
          this._updateCloudStatus();
        });

        client.on('error', (err) => {
          console.warn(`[CloudRelay #${index + 1}] Warning:`, err && err.message ? err.message : err);
        });

        this.mqttClients.push(client);
        if (!this.mqttClient) {
          this.mqttClient = client;
        }
      } catch (e) {
        console.warn(`[CloudRelay #${index + 1}] Error initializing MQTT:`, e);
      }
    });
  }

  _flushPendingToClient(client) {
    if (!this.roomId || !client.connected || !client._subscribed) return;
    if (this.pendingMessages.length === 0) return;

    const topic = `loykrathong/couple/room/${this.roomId}`;
    const toFlush = this.pendingMessages.slice(-10);
    toFlush.forEach((serialized) => {
      try {
        if (serialized.length <= this.MAX_MQTT_BYTES) {
          client.publish(topic, serialized, { qos: 1 });
        }
      } catch (e) {}
    });
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

    const activeRoom = this.roomId;
    const peerId = this.isHost
      ? `loy-krathong-${activeRoom.toLowerCase()}-host`
      : `loy-krathong-${activeRoom.toLowerCase()}-guest-${Math.floor(Math.random() * 10000)}`;

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
        if (this.roomId !== activeRoom) return;
        console.log('[PeerJS] Ready with ID:', id);
        if (!this.isHost) {
          const hostId = `loy-krathong-${activeRoom.toLowerCase()}-host`;
          this.conn = this.peer.connect(hostId, { reliable: true });
          this.setupConnectionHandlers();
        }
      });

      this.peer.on('connection', (connection) => {
        if (this.roomId !== activeRoom) return;
        console.log('[PeerJS] Incoming connection from partner!');
        this.conn = connection;
        this.setupConnectionHandlers();
      });

      this.peer.on('error', (err) => {
        console.warn('[PeerJS] Notice:', err && err.type ? err.type : err);
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
      this.sendHandshake();
      this.sendStateSync();
    });

    this.conn.on('data', (data) => {
      this.handleIncomingData(data, 'webrtc');
    });

    this.conn.on('close', () => {
      console.log('[PeerJS] Partner DataChannel closed (MQTT relay remains active)');
    });
  }

  // --- 4. PERIODIC HEARTBEAT & SELF-HEALING STATE SYNC ---
  startHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
    }
    this.heartbeatTimer = setInterval(() => {
      if (!this.roomId) return;
      if (!this.partnerJoined) {
        this.sendHandshake();
      }
      this.sendStateSync();
    }, 2500);
  }

  sendHandshake() {
    if (!this.roomId) return;
    const snap = this.getLocalStateSnapshot();
    this.send({
      type: 'HANDSHAKE',
      sender: this.isHost ? 'host' : 'guest',
      isReady: !!snap.isReady,
      readySeq: typeof snap.readySeq === 'number' ? snap.readySeq : 0,
      isCountingDown: !!snap.isCountingDown,
      screen: snap.screen || 'studio',
      myName: snap.myName || '',
      partnerName: snap.partnerName || '',
      timestamp: Date.now()
    });
  }

  sendStateSync() {
    if (!this.roomId) return;
    const snap = this.getLocalStateSnapshot();
    this.send({
      type: 'STATE_SYNC',
      sender: this.isHost ? 'host' : 'guest',
      isReady: !!snap.isReady,
      readySeq: typeof snap.readySeq === 'number' ? snap.readySeq : 0,
      isCountingDown: !!snap.isCountingDown,
      screen: snap.screen || 'studio',
      myName: snap.myName || '',
      partnerName: snap.partnerName || '',
      timestamp: Date.now()
    }, { skipQueue: true });
  }

  // --- SEND DATA TO PARTNER ---
  send(payload, options = {}) {
    if (!this.roomId) return;

    // Generate unique message ID to prevent duplicate handling
    const msgId = `${this.clientId}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const packet = Object.assign({}, payload, {
      msgId,
      roomId: this.roomId,
      senderId: this.isHost ? 'host' : 'guest',
      fromClient: this.clientId
    });

    // Track own sent messages
    this.processedMsgIds.add(msgId);
    if (this.processedMsgIds.size > 400) {
      const first = this.processedMsgIds.values().next().value;
      this.processedMsgIds.delete(first);
    }

    const serialized = JSON.stringify(packet);
    const topic = `loykrathong/couple/room/${this.roomId}`;

    // 1. Send via ALL connected Global Cloud MQTT brokers (Cross-Country Guaranteed Delivery)
    let publishedToMqtt = false;
    if (serialized.length <= this.MAX_MQTT_BYTES) {
      this.mqttClients.forEach((client) => {
        if (client && client.connected) {
          try {
            client.publish(topic, serialized, { qos: 1 });
            publishedToMqtt = true;
          } catch (e) {
            console.warn('MQTT publish error:', e);
          }
        }
      });

      // Buffer important control messages if no MQTT broker is connected yet
      if (!publishedToMqtt && !options.skipQueue) {
        this.pendingMessages.push(serialized);
        if (this.pendingMessages.length > 15) {
          this.pendingMessages.shift();
        }
      }
    } else {
      console.warn(`[CloudRelay] Skipped oversized MQTT packet (${Math.round(serialized.length / 1024)} KB) for type:`, packet.type);
    }

    // 2. Send via WebRTC DataChannel (Ultra-low latency P2P)
    if (this.conn && this.conn.open && serialized.length <= this.MAX_MQTT_BYTES) {
      try {
        this.conn.send(packet);
      } catch (e) {
        console.warn('WebRTC send error:', e);
      }
    }

    // 3. Send via BroadcastChannel (Same machine multi-tab)
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage(packet);
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

  _shouldAcceptReadySeq(data) {
    // Reset sequence tracking if partner refreshed / got a new clientId
    if (data.fromClient && data.fromClient !== this.lastPartnerClientId) {
      this.lastPartnerClientId = data.fromClient;
      this.lastPartnerReadySeq = -1;
    }
    if (typeof data.readySeq === 'number') {
      if (data.readySeq < this.lastPartnerReadySeq) {
        return false; // Ignore stale out-of-order ready state
      }
      this.lastPartnerReadySeq = data.readySeq;
    }
    return true;
  }

  // --- HANDLE INCOMING DATA WITH DEDUPLICATION ---
  handleIncomingData(data, source) {
    if (!data || !data.type) return;

    // Ignore messages from other rooms or self
    if (data.roomId && this.roomId && data.roomId !== this.roomId) return;
    if (data.fromClient === this.clientId) return;

    // Deduplicate (since message may arrive via multiple MQTT brokers + WebRTC)
    if (data.msgId) {
      if (this.processedMsgIds.has(data.msgId)) return;
      this.processedMsgIds.add(data.msgId);
      if (this.processedMsgIds.size > 400) {
        const first = this.processedMsgIds.values().next().value;
        this.processedMsgIds.delete(first);
      }
    }

    const wasAlreadyJoined = this.partnerJoined;
    this.triggerPartnerConnected(data);

    switch (data.type) {
      case 'HANDSHAKE': {
        // BOTH host and guest reply to HANDSHAKE so neither side is ever stuck unconnected!
        const snap = this.getLocalStateSnapshot();
        this.send({
          type: 'HANDSHAKE_ACK',
          sender: this.isHost ? 'host' : 'guest',
          isReady: !!snap.isReady,
          readySeq: typeof snap.readySeq === 'number' ? snap.readySeq : 0,
          isCountingDown: !!snap.isCountingDown,
          screen: snap.screen || 'studio',
          myName: snap.myName || '',
          partnerName: snap.partnerName || '',
          timestamp: Date.now()
        }, { skipQueue: true });

        // If partner reconnected (e.g. returned from WhatsApp/LINE), resync our krathong & ready state
        if (wasAlreadyJoined && this.onPartnerResyncNeeded) {
          this.onPartnerResyncNeeded(data);
        }
        if (this._shouldAcceptReadySeq(data) && this.onPartnerStateSync) {
          this.onPartnerStateSync(data);
        }
        break;
      }

      case 'HANDSHAKE_ACK':
      case 'STATE_SYNC':
        if (this._shouldAcceptReadySeq(data) && this.onPartnerStateSync) {
          this.onPartnerStateSync(data);
        }
        break;

      case 'STATUS_UPDATE':
        if (this.onPartnerStatus) this.onPartnerStatus(data.status, data);
        break;

      case 'KRATHONG_SYNC':
        if (this.onPartnerKrathong) this.onPartnerKrathong(data.config);
        break;

      case 'READY_CHANGE':
        if (this._shouldAcceptReadySeq(data) && this.onPartnerReadyChange) {
          this.onPartnerReadyChange(!!data.isReady, data.config);
        }
        break;

      case 'COUNTDOWN_START':
        if (this._shouldAcceptReadySeq(data) && this.onCountdownStart) {
          this.onCountdownStart(data.startTimestamp, data);
        }
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

  sendReadyChange(isReady, config, readySeq) {
    const payload = { type: 'READY_CHANGE', isReady: !!isReady, config };
    if (typeof readySeq === 'number') payload.readySeq = readySeq;
    this.send(payload);
  }

  sendCountdownStart(startTimestamp, readySeq) {
    const payload = {
      type: 'COUNTDOWN_START',
      startTimestamp: startTimestamp || Date.now(),
      isReady: true
    };
    if (typeof readySeq === 'number') payload.readySeq = readySeq;
    this.send(payload);
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
