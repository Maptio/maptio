export interface Serializable<T> {

    /**
     * Deserializes a given object into an object of type T
     */
    deserialize: ((input: any) => T);

    /**Try to deserialize a given object into an object of type T.
     * Returns true if parse succeeed, false otherwise
     */
    tryDeserialize: ((input: any) => [boolean, T]);
}