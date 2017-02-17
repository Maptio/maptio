export interface Serializable<T> {
    
    /**Deserializes a given object into an object of type T */
    deserialize: ((input: any) => T);
}