import { ITreeNode } from '../interfaces/treenode.interface'
import { Injectable, OnInit } from '@angular/core'


@Injectable()
export class TreeExplorationService {

    traverse<T extends ITreeNode>(node: T, callback: ((n: T) => void)): void {
        if (node.children) {
            node.children.forEach(function (child: T) {
                callback.apply(this, [child]);
                this.traverse(child, callback);
            })
        }
    }

    reset<T extends ITreeNode>(nodes: Array<T>, callback: ((n: T) => void)) {
        nodes.forEach(function (n: T) {
            callback.apply(this, [n]);
            this.traverse(n, function (node: T) { callback.apply(this, [node]); });
        });
    }

}