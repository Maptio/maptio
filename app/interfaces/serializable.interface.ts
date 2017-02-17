export interface Serializable<T> {
    deserialize: ((input: any) => T);
}