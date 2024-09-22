export type MapKey = string | number | symbol;

export interface Listeners<K, V> {
  add: Array<(key: K, value: V) => void>;
  remove: Array<(key: K) => void>;
}

interface ObservableMap<K extends MapKey, V> extends Map<K, V> {
  onAdd(callback: (key: K, value: V) => void): void;
  onRemove(callback: (key: K) => void): void;
}

export function createObservableMap<K extends MapKey, V>(): ObservableMap<K, V> {
  const map = new Map<K, V>();
  const listeners: Listeners<K, V> = {
    add: [],
    remove: []
  };

  const handler: ProxyHandler<Map<K, V>> = {
    get(target, prop, receiver) {
      if (prop === 'set') {
        return function(key: K, value: V) {
          const isNewKey = !target.has(key);
          target.set(key, value);
          if (isNewKey) {
            listeners.add.forEach(callback => callback(key, value));
          }
          return receiver;
        };
      }

      if (prop === 'delete') {
        return function(key: K) {
          const hasKey = target.has(key);
          const result = target.delete(key);
          if (hasKey && result) {
            listeners.remove.forEach(callback => callback(key));
          }
          return result;
        };
      }

      if (prop === 'clear') {
        return function() {
          const keys = Array.from(target.keys());
          target.clear();
          keys.forEach(key => listeners.remove.forEach(callback => callback(key)));
        };
      }

      if (prop === 'onAdd') {
        return function(callback: (key: K, value: V) => void) {
          listeners.add.push(callback);
        };
      }

      if (prop === 'onRemove') {
        return function(callback: (key: K) => void) {
          listeners.remove.push(callback);
        };
      }

      const value = (target as any)[prop];
      if (typeof value === 'function') {
        return value.bind(target);
      }
      return value;
    }
  };

  return new Proxy(map, handler) as ObservableMap<K, V>;
}

