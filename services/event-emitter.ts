// Simple event emitter for React Native (tanpa dependency Node.js)
type Listener = (...args: any[]) => void;

class AppEventEmitter {
  private events: Map<string, Listener[]> = new Map();

  on(event: string, listener: Listener) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event)!.push(listener);
  }

  off(event: string, listener: Listener) {
    const listeners = this.events.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  emit(event: string, ...args: any[]) {
    const listeners = this.events.get(event);
    if (listeners) {
      listeners.forEach(listener => listener(...args));
    }
  }

  removeAllListeners(event?: string) {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
  }
}

export const appEvents = new AppEventEmitter();

// Event types
export const APP_EVENTS = {
  UNAUTHORIZED: "unauthorized",
  TOKEN_EXPIRED: "token_expired",
} as const;
