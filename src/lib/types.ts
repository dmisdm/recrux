export type Optional<T> = { [key in keyof T]?: T[key] };

export type StringMap<V> = { [key: string]: V };
