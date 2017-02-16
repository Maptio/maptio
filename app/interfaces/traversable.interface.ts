export interface ITraversable {

    /**Children nodes */
    children: Array<ITraversable>;

    /**Traverses given node and applies callback function provided to all children  */
    traverse(this: ITraversable, callback: ((n: ITraversable) => void)): void;
}