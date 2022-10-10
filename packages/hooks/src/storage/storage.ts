export abstract class AbstractStorage<K, V> {
  abstract getItem(key: K): V | null;
  abstract getItem(key: K, defaultValue: V): V;

  abstract setItem(key: K, value: V): void;

  abstract removeItem(key: K): void;

  abstract clear(): void;
}
