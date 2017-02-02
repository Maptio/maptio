import { ITreeNode } from '../interfaces/treenode.interface'
import { Injectable, OnInit } from '@angular/core'


@Injectable()
export class TreeExplorationService {

    static traverseOne<T extends ITreeNode>(node: T, callback: ((n: T) => void)): void {
        
        if (node.children) {
            node.children.forEach(function (child: T) {
                callback.apply(this, [child]);
                TreeExplorationService.traverseOne(child, callback);
            })
        }
    }

    static traverseAll<T extends ITreeNode>(nodes: Array<T>, callback: ((n: T) => void)) {
        nodes.forEach(function (n: T) {
            callback.apply(this, [n]);
            TreeExplorationService.traverseOne(n, function (node: T) { callback.apply(this, [node]); });
        });
    }

}