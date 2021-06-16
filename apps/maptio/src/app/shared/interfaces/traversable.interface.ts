export interface ITraversable {

    /**Children nodes */
    children: Array<any>;

    /**Traverses given node and applies callback function provided to all children  */
    traverse: (callback: ((n: ITraversable) => void)) => void ;
}