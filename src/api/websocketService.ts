// src/api/websocketService.ts
import { useAuthStore } from "../store/authStore";
import { WS_BASE_URL, API_CONFIG, ENDPOINTS } from "../constants/api";

// WebSocket event types
export enum WsEventType {
  CONNECT = "connect",
  DISCONNECT = "disconnect",
  RECONNECT_ATTEMPT = "reconnect_attempt",
  RECONNECT_FAILED = "reconnect_failed",
  RECONNECT_SUCCESS = "reconnect_success",
  LOCATION_UPDATE = "location_update",
  DRIVER_STATUS = "driver_status",
  TRIP_REQUEST = "trip_request",
  TRIP_CANCELLED = "trip_cancelled",
  TRIP_ACCEPTED = "trip_accepted",
  TRIP_STARTED = "trip_started",
  TRIP_COMPLETED = "trip_completed",
  PAYMENT_COMPLETED = "payment_completed",
  SAFETY_ALERT = "safety_alert",
}

// WebSocket message types (matching your Django Channels consumer)
export enum WsMessageType {
  LOCATION_UPDATE = "location_update",
  STATUS_UPDATE = "status_update",
  TRIP_RESPONSE = "trip_response",
  EMERGENCY_ALERT = "emergency_alert",
  PAYMENT_UPDATE = "payment_update",
  PING = "ping",
}

// Event listener type
type WsEventListener = (data: any) => void;

/**
 * WebSocket service for real-time communication
 */
class WebSocketService {
  private socket: WebSocket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private connectionTimeout: NodeJS.Timeout | null = null;
  private userId: string | null = null;
  private userType: "rider" | "driver" | null = null;
  private eventListeners: Record<string, WsEventListener[]> = {};

  /**
   * Initialize WebSocket connection
   * @param userId - User ID
   * @param userType - User type (rider or driver)
   * @returns Promise<boolean> - Success status
   */
  async initialize(
    userId: string,
    userType: "rider" | "driver"
  ): Promise<boolean> {
    this.userId = userId;
    this.userType = userType;
    return this.connect();
  }

  /**
   * Connect to the WebSocket server
   * @returns Promise<boolean> - Success status
   */
  async connect(): Promise<boolean> {
    try {
      // Clear any existing connection
      this.cleanup();

      // Get authentication token - this is the key part!
      const token = useAuthStore.getState().token;
      if (!token) {
        console.error("WebSocketService: No authentication token available");
        return false;
      }

      // Create WebSocket URL with authentication token in query params
      // This must match what your Django middleware expects
      const wsUrl = `${ENDPOINTS.RIDES_SOCKET}?token=${token}`;

      console.log(
        "Connecting to WebSocket at:",
        wsUrl.replace(token, "TOKEN_HIDDEN")
      );

      // Create WebSocket connection
      this.socket = new WebSocket(wsUrl);

      // Set up event handlers
      this.socket.onopen = this.handleOpen.bind(this);
      this.socket.onmessage = this.handleMessage.bind(this);
      this.socket.onerror = this.handleError.bind(this);
      this.socket.onclose = this.handleClose.bind(this);

      return true;
    } catch (error) {
      console.error("WebSocketService: Failed to connect", error);
      this.attemptReconnect();
      return false;
    }
  }

  /**
   * Handle successful WebSocket connection
   */
  private handleOpen(): void {
    console.log("WebSocketService: Connection established");
    this.isConnected = true;
    this.reconnectAttempts = 0;

    // Clear connection timeout
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
    }

    // Start heartbeat to keep connection alive
    this.startHeartbeat();

    // Notify listeners about successful connection
    this.emitEvent(WsEventType.CONNECT);
  }

  /**
   * Handle incoming WebSocket messages
   * @param event - The WebSocket message event
   */
  private handleMessage(event: MessageEvent): void {
    try {
      const data = JSON.parse(event.data);
      console.log("WebSocketService: Received message", data);

      // Handle different message types
      if (data.type) {
        this.emitEvent(data.type, data.payload);
      }
    } catch (error) {
      console.error("WebSocketService: Failed to parse message", error);
    }
  }

  /**
   * Handle WebSocket errors
   * @param error - The WebSocket error event
   */
  private handleError(error: Event): void {
    console.error("WebSocketService: WebSocket error", error);

    // Log more details about the connection attempt
    console.error("WebSocket connection details:", {
      readyState: this.socket?.readyState,
      url: this.socket?.url.replace(/token=([^&]*)/, "token=TOKEN_HIDDEN"),
    });

    this.emitEvent(WsEventType.DISCONNECT, { error: true });
  }

  /**
   * Handle WebSocket connection close
   * @param event - The WebSocket close event
   */
  private handleClose(event: CloseEvent): void {
    console.warn(
      `WebSocketService: Connection closed: ${event.code} ${event.reason}`
    );
    this.isConnected = false;
    this.stopHeartbeat();

    // Notify listeners about disconnection
    this.emitEvent(WsEventType.DISCONNECT, {
      code: event.code,
      reason: event.reason,
    });

    // Attempt to reconnect
    this.attemptReconnect();
  }

  /**
   * Send a message to the WebSocket server
   * @param type - Message type
   * @param payload - Message payload
   * @returns boolean - Success status
   */
  send(type: WsMessageType, payload: any): boolean {
    if (!this.isConnected || !this.socket) {
      console.warn("WebSocketService: Cannot send message: Not connected");
      return false;
    }

    try {
      const message = JSON.stringify({ type, payload });
      console.log("WebSocketService: Sending message", { type, payload });
      this.socket.send(message);
      return true;
    } catch (error) {
      console.error("WebSocketService: Failed to send message", error);
      return false;
    }
  }

  /**
   * Update user location
   * @param location - Location data { latitude, longitude, accuracy, speed }
   * @returns boolean - Success status
   */
  updateLocation(location: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    speed?: number;
    heading?: number;
  }): boolean {
    return this.send(WsMessageType.LOCATION_UPDATE, location);
  }

  /**
   * Update driver status (for driver app)
   * @param status - New status (online, offline, busy)
   * @returns boolean - Success status
   */
  updateDriverStatus(status: "online" | "offline" | "busy"): boolean {
    if (this.userType !== "driver") {
      console.warn(
        "WebSocketService: Cannot update driver status for non-driver user"
      );
      return false;
    }
    return this.send(WsMessageType.STATUS_UPDATE, { status });
  }

  /**
   * Respond to a trip request (for driver app)
   * @param tripId - Trip ID
   * @param accepted - Whether the trip was accepted
   * @returns boolean - Success status
   */
  respondToTrip(tripId: string, accepted: boolean): boolean {
    if (this.userType !== "driver") {
      console.warn(
        "WebSocketService: Cannot respond to trip for non-driver user"
      );
      return false;
    }
    return this.send(WsMessageType.TRIP_RESPONSE, {
      trip_id: tripId,
      accepted,
    });
  }

  /**
   * Send emergency alert
   * @param data - Emergency data
   * @returns boolean - Success status
   */
  sendEmergencyAlert(data: {
    location: { latitude: number; longitude: number };
    details?: string;
  }): boolean {
    return this.send(WsMessageType.EMERGENCY_ALERT, data);
  }

  /**
   * Start heartbeat to keep connection alive
   */
  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatInterval = setInterval(() => {
      // Send a ping message to keep the connection alive
      this.send(WsMessageType.PING, { timestamp: Date.now() });
    }, API_CONFIG.WS_CONFIG.HEARTBEAT_INTERVAL_MS);
  }

  /**
   * Stop heartbeat interval
   */
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Attempt to reconnect with exponential backoff
   */
  private attemptReconnect(): void {
    // Clear any existing reconnect attempts
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    // Check if we've exceeded max reconnect attempts
    if (this.reconnectAttempts >= API_CONFIG.WS_CONFIG.RECONNECT_ATTEMPTS) {
      console.error("WebSocketService: Maximum reconnect attempts reached");
      this.emitEvent(WsEventType.RECONNECT_FAILED);
      return;
    }

    // Calculate backoff delay with exponential increase and some randomness
    const delay = Math.min(
      API_CONFIG.WS_CONFIG.RECONNECT_DELAY_MS *
        Math.pow(1.5, this.reconnectAttempts) +
        Math.random() * 1000,
      60000 // Max 1 minute delay
    );

    this.reconnectAttempts++;

    console.log(
      `WebSocketService: Reconnecting in ${Math.round(
        delay / 1000
      )}s (attempt ${this.reconnectAttempts})`
    );

    // Notify about reconnection attempt
    this.emitEvent(WsEventType.RECONNECT_ATTEMPT, {
      attempt: this.reconnectAttempts,
      delay: delay,
    });

    // Schedule reconnection
    this.reconnectTimeout = setTimeout(async () => {
      const success = await this.connect();
      if (success) {
        this.emitEvent(WsEventType.RECONNECT_SUCCESS, {
          attempts: this.reconnectAttempts,
        });
      }
    }, delay);
  }

  /**
   * Add event listener
   * @param event - Event name
   * @param callback - Event callback
   */
  addEventListener(event: string, callback: WsEventListener): void {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(callback);
  }

  /**
   * Remove event listener
   * @param event - Event name
   * @param callback - Event callback to remove
   */
  removeEventListener(event: string, callback: WsEventListener): void {
    if (!this.eventListeners[event]) return;

    this.eventListeners[event] = this.eventListeners[event].filter(
      (cb) => cb !== callback
    );
  }

  /**
   * Emit event to all listeners
   * @param event - Event name
   * @param data - Event data
   */
  private emitEvent(event: string, data?: any): void {
    if (!this.eventListeners[event]) return;

    this.eventListeners[event].forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error(
          `WebSocketService: Error in event listener for ${event}`,
          error
        );
      }
    });
  }

  /**
   * Clean up all resources
   */
  cleanup(): void {
    this.stopHeartbeat();

    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.socket) {
      // Remove event handlers
      this.socket.onopen = null;
      this.socket.onmessage = null;
      this.socket.onerror = null;
      this.socket.onclose = null;

      // Close connection if it's open
      if (this.isConnected) {
        this.socket.close(1000, "Client disconnecting");
      }

      this.socket = null;
    }

    this.isConnected = false;
  }

  /**
   * Disconnect WebSocket connection
   */
  disconnect(): void {
    console.log("WebSocketService: Disconnecting");
    this.cleanup();
  }

  /**
   * Check if WebSocket is connected
   * @returns boolean - Connection status
   */
  isConnectedToServer(): boolean {
    return this.isConnected;
  }
}

// Create singleton instance
const websocketService = new WebSocketService();

export default websocketService;
