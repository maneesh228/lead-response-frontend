// Socket.IO Service for Real-time Updates
import io from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:3001';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map(); // Now stores arrays of callbacks
  }

  connect(token) {
    if (this.socket?.connected) {
      console.log('Socket already connected, returning existing connection');
      return this.socket;
    }

    console.log('Connecting to Socket.IO server at:', SOCKET_URL);
    this.socket = io(SOCKET_URL, {
      auth: {
        token: token
      },
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      timeout: 10000,
      forceNew: false,
      autoConnect: true
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket connected successfully! Socket ID:', this.socket.id);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('🔴 Socket connection error:', error.message);
      // Fallback to polling if websocket fails
      if (this.socket.io.opts.transports.includes('websocket')) {
        console.log('Falling back to polling transport');
      }
    });

    this.socket.on('error', (error) => {
      console.error('🔴 Socket error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Listen for new Facebook messages
  onFacebookMessage(callback) {
    if (!this.socket) {
      console.error('❌ Socket not initialized for Facebook messages');
      return;
    }
    
    const event = 'facebook:new_message';
    console.log('📡 Setting up listener for:', event);
    
    // Add to listeners array
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
      
      // Set up the main socket listener that calls all callbacks
      this.socket.on(event, (data) => {
        console.log('🔔 Received facebook:new_message event:', data);
        const callbacks = this.listeners.get(event) || [];
        console.log(`Calling ${callbacks.length} callback(s)`);
        callbacks.forEach(cb => cb(data));
      });
    }
    
    // Add callback to array if not already present
    const callbacks = this.listeners.get(event);
    if (!callbacks.includes(callback)) {
      callbacks.push(callback);
      console.log(`✅ Added Facebook message callback. Total callbacks: ${callbacks.length}`);
    }
  }

  // Listen for new Instagram messages
  onInstagramMessage(callback) {
    if (!this.socket) {
      console.error('❌ Socket not initialized for Instagram messages');
      return;
    }
    
    const event = 'instagram:new_message';
    console.log('📡 Setting up listener for:', event);
    
    // Add to listeners array
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
      
      // Set up the main socket listener that calls all callbacks
      this.socket.on(event, (data) => {
        console.log('🔔 Received instagram:new_message event:', data);
        const callbacks = this.listeners.get(event) || [];
        console.log(`Calling ${callbacks.length} callback(s)`);
        callbacks.forEach(cb => cb(data));
      });
    }
    
    // Add callback to array if not already present
    const callbacks = this.listeners.get(event);
    if (!callbacks.includes(callback)) {
      callbacks.push(callback);
      console.log(`✅ Added Instagram message callback. Total callbacks: ${callbacks.length}`);
    }
  }

  // Listen for message sent confirmation
  onMessageSent(callback) {
    if (!this.socket) return;
    
    const event = 'message:sent';
    
    // Add to listeners array
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
      
      // Set up the main socket listener that calls all callbacks
      this.socket.on(event, (data) => {
        const callbacks = this.listeners.get(event) || [];
        callbacks.forEach(cb => cb(data));
      });
    }
    
    // Add callback to array if not already present
    const callbacks = this.listeners.get(event);
    if (!callbacks.includes(callback)) {
      callbacks.push(callback);
    }
  }

  // Listen for enquiry updates
  onEnquiryUpdate(callback) {
    if (!this.socket) return;
    
    const event = 'enquiry:updated';
    
    // Add to listeners array
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
      
      // Set up the main socket listener that calls all callbacks
      this.socket.on(event, (data) => {
        const callbacks = this.listeners.get(event) || [];
        callbacks.forEach(cb => cb(data));
      });
    }
    
    // Add callback to array if not already present
    const callbacks = this.listeners.get(event);
    if (!callbacks.includes(callback)) {
      callbacks.push(callback);
    }
  }

  // Remove specific listener
  off(event, callback) {
    if (!this.socket) return;
    
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      // Remove specific callback from array
      if (callback) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      } else {
        // Remove all callbacks for this event
        this.socket.off(event);
        this.listeners.delete(event);
      }
    }
  }

  // Remove all listeners
  removeAllListeners() {
    if (!this.socket) return;
    
    this.listeners.forEach((callbacks, event) => {
      this.socket.off(event);
    });
    this.listeners.clear();
  }

  // Emit custom events
  emit(event, data) {
    if (!this.socket) return;
    this.socket.emit(event, data);
  }
}

// Export singleton instance
const socketService = new SocketService();
export default socketService;
