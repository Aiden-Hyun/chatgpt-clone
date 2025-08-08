type Listener<T = any> = (payload?: T) => void;

class SimpleEventEmitter {
  private listeners = new Map<string, Set<Listener>>();

  on<T = any>(event: string, listener: Listener<T>): () => void {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(listener as Listener);
    return () => this.off(event, listener as Listener);
  }

  off(event: string, listener: Listener): void {
    this.listeners.get(event)?.delete(listener);
  }

  emit<T = any>(event: string, payload?: T): void {
    const set = this.listeners.get(event);
    if (!set) return;
    set.forEach((fn) => {
      try { fn(payload); } catch {}
    });
  }
}

export const GlobalEvents = new SimpleEventEmitter();
export const GLOBAL_EVENT_TYPES = {
  ROOMS_CREATED: 'rooms:created',
};


