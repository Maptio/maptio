import { Injectable, inject } from '@angular/core';
import { Initiative } from '@maptio-shared/model/initiative.data';
import { Tag } from '@maptio-shared/model/tag.data';
import { WorkspaceService } from '../../../workspace/workspace.service';

@Injectable({ providedIn: 'root' })
export class MapEditingService {
  private workspaceService = inject(WorkspaceService);

  /**
   * Removes a node with the given id from the tree rooted at rootNode.
   * Returns true if a node was removed, false otherwise.
   */
  removeNodeFromTree(rootNode: Initiative, nodeId: number): boolean {
    if (!rootNode || !rootNode.children) return false;
    const index = rootNode.children.findIndex((c) => c.id === nodeId);
    if (index > -1) {
      rootNode.children.splice(index, 1);
      return true;
    } else {
      let found = false;
      rootNode.traverse((n: Initiative) => {
        if (found || !n.children) return;
        const idx = n.children.findIndex((c) => c.id === nodeId);
        if (idx > -1) {
          n.children.splice(idx, 1);
          found = true;
        }
      });
      return found;
    }
  }

  /**
   * Removes a node and saves the updated initiative and tags.
   * If tags are not provided, uses the current tags from WorkspaceService.
   * Returns true if node was deleted and saveChanges was called, false otherwise.
   */
  async deleteNodeAndSave(
    rootNode: Initiative,
    nodeId: number,
    tags?: Tag[]
  ): Promise<boolean> {
    const deleted = this.removeNodeFromTree(rootNode, nodeId);
    if (deleted) {
      const tagsToUse = tags ?? this.workspaceService.tags();
      await this.workspaceService.saveChanges({
        initiative: rootNode,
        tags: tagsToUse,
      });
      this.workspaceService.sendInitiativesToOutliner(rootNode);
      return true;
    }
    return false;
  }

  /**
   * Removes a node by id from the current workspace root initiative and saves the changes.
   * Returns true if node was deleted and saveChanges was called, false otherwise.
   */
  async deleteNodeByIdFromWorkspaceAndSave(nodeId: number): Promise<boolean> {
    const rootInitiative = this.workspaceService.dataset()?.initiative;
    if (!rootInitiative) return false;
    return this.deleteNodeAndSave(rootInitiative, nodeId);
  }
}
