import { Injectable } from '@angular/core';
import { ITraversable } from '../interfaces/traversable.interface';
import { Serializable } from '../interfaces/serializable.interface';
import * as slug from 'slug';
import { Helper } from './helper.data';
import { Role } from './role.data';
import { compact, remove, flatten } from 'lodash-es';
import { Tag } from './tag.data';

@Injectable()
/**
 * Represents an initiative
 */
export class Initiative implements ITraversable, Serializable<Initiative> {
  /** Unique Id */
  id: number;

  /** Short name for the initiative. */
  name: string;

  /**
   * URL friendly name
   */
  // slug: string = slug(this.name);

  /** Description of initiative */
  description: string = undefined;

  /** Children nodes */
  children: Array<Initiative>;

  /** Starting date of initiative */
  start: Date;

  /**Accountable  */
  accountable: Helper;

  /**
   * List of helpers
   * REFACTOR : this should be a Set<Helper>
   */
  helpers: Array<Helper> = [];

  /**
   * List of helpers
   * REFACTOR : this should be a Set<Helper>
   */
  vacancies: Array<Role> = [];

  /**
   * List of tags
   */
  tags: Array<Tag> = [];

  /**
   * Size adjustment as specified by user through UI
   */
  sizeAdjustment: number;

  /**
   * Final size adjustment computed from user-defined adjustments
   *
   * In the D3 circle-packing algorithm the values assigned to each circle
   * (depending on number of helpers, etc.) directly correlate to the final
   * radius only for leaf circles. To adjust the size of a parent circle we
   * need to distribute its `sizeAdjustment` evenly across the child
   * nodes.
   *
   * TODO: This really shouldn't live on the model!
   */
  computedSizeAdjustment = 0;

  /**
   * Team
   */
  // private _URL = "assets/images/logo.png"
  // private _MEMBERS = [
  //     new User({ name: "Safiyya", picture: this._URL, user_id: "safiyya_id" }),
  //     new User({ name: "Gabriel", picture: this._URL, user_id: "gabriel_id" }),
  //     new User({ name: "Kamil", picture: this._URL, user_id: "kamil_id" }),
  //     new User({ name: "Mouris", picture: this._URL, user_id: "mouris_id" }),
  //     new User({ name: "Nassera", picture: this._URL, user_id: "nassera_id" })]

  team_id: string;

  // @ignore
  // team: Team; //= new Team({ members: this._MEMBERS });

  /**True if this is the root of the tree */
  // isRoot: boolean = false;

  /**True if this node is focused on */
  hasFocus = false;

  /**True if this node is zoomed on */
  isZoomedOn = false;

  /**True if this node matches a search */
  isSearchedFor = false;

  /**True if this node can be dragged&dropped */
  isDraggable: boolean;

  isExpanded: boolean;

  authorityCentricMode = true;

  public constructor(init?: Partial<Initiative>) {
    Object.assign(this, init);
  }

  static create() {
    return new Initiative();
  }

  deserialize(input: any): Initiative {
    this.id = input.id;
    this.name = input.name;
    this.description = input.description;
    this.start = input.start;
    this.team_id = input.team_id;
    this.authorityCentricMode = input.authorityCentricMode;
    // this.slug = input.slug;
    if (input.accountable) {
      this.accountable = new Helper().deserialize(input.accountable);
    }
    this.sizeAdjustment = input.sizeAdjustment;

    let children = new Array<Initiative>();
    if (input.children) {
      input.children.forEach(function (inputChild: any) {
        children.push(new Initiative().deserialize(inputChild));
      });
    } else {
      children = undefined;
    }

    let helpers = new Array<Helper>();
    if (input.helpers) {
      input.helpers.forEach(function (inputHelper: any) {
        helpers.push(new Helper().deserialize(inputHelper));
      });
    } else {
      helpers = [];
    }

    let vacancies = new Array<Role>();
    if (input.vacancies) {
      input.vacancies.forEach(function (inputRole: any) {
        vacancies.push(new Role().deserialize(inputRole));
      });
    } else {
      vacancies = [];
    }

    let tags = new Array<Tag>();
    if (input.tags && input.tags instanceof Array) {
      input.tags.forEach(function (inputTag: any) {
        tags.push(new Tag().deserialize(inputTag));
      });
    } else {
      tags = [];
    }

    this.children = children;
    this.helpers = helpers;
    this.vacancies = vacancies;
    this.tags = tags;
    return this;
  }

  /** N */
  tryDeserialize(input: any): [boolean, Initiative] {
    throw new Error('Not implemented');
  }

  traverse(callback: (n: Initiative) => void): void {
    if (this.children) {
      this.children.forEach(function (child: Initiative) {
        callback.apply(this, [child]);
        (<Initiative>child).traverse(callback);
      });
    }
  }

  traversePromise(
    callback: (n: Initiative) => Promise<void>
  ): Array<Promise<void>> {
    const queue: Array<Promise<void>> = [];

    const recursion = (node: Initiative) => {
      // queue.push(callback.apply(this, [node]));
      if (node.children) {
        node.children.forEach(function (child: Initiative) {
          queue.push(callback.apply(this, [child]));
          recursion(child);
        });
      }
    };
    recursion(this);
    return queue;
  }

  flatten(): Initiative[] {
    const array: Initiative[] = [];
    this.traverse((n) => {
      array.push(n);
    });
    return array;
  }

  getParent(tree: Initiative): Initiative {
    let parent: Initiative;
    const id = this.id;
    tree.children = tree.children || [];
    if (
      tree.children.findIndex((c) => {
        return c.id === id;
      }) >= 0
    ) {
      return tree;
    }
    tree.traverse((n) => {
      if (n.children && n.children.findIndex((c) => c.id === id) >= 0) {
        parent = n;
        return;
      }
    });
    return parent;
  }

  search(searched: string): boolean {
    if (searched === '') {
      return true;
    } else {
      if (
        (this.name &&
          this.name.toLowerCase().includes(searched.toLowerCase())) ||
        (this.description &&
          this.description.toLowerCase().includes(searched.toLowerCase()))
      ) {
        return true;
      }
      return false;
    }
  }

  getSlug() {
    // HACK : quick fix for non latin characters
    return (
      slug(this.name || (this.id ? this.id.toString() : 'initiative'), {
        lower: true,
      }) || 'initiative'
    );
  }

  getRoles(userId: string): Role[] {
    return compact([...this.helpers, this.accountable]).filter(
      (h) => h.user_id === userId
    )[0]
      ? compact([...this.helpers, this.accountable]).filter(
          (h) => h.user_id === userId
        )[0].roles
      : [];
  }

  getAllParticipants() {
    return remove(flatten([...[this.accountable], this.helpers]));
  }
}
