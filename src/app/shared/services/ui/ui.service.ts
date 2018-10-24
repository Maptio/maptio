import { Injectable } from "@angular/core";
import { D3Service, D3, Selection, BaseType } from "d3-ng2-service";
import "rxjs/add/operator/map";
import "rxjs/add/operator/toPromise";
import { Tag } from "../../model/tag.data";
import { Initiative } from "../../model/initiative.data";
import { Helper } from "../../model/helper.data";
import { MarkdownService } from "angular2-markdown";
import { Role } from "../../model/role.data";
import { User } from "../../model/user.data";
import { isEmpty, intersection } from "lodash"

@Injectable()
export class UIService {
  private d3: D3;

  // private tooltip$: Subject<[string, Initiative, Initiative]>

  constructor(d3Service: D3Service, private markdown: MarkdownService) {
    this.d3 = d3Service.getD3();
    // this.tooltip$ = new Subject<[string, Initiative, Initiative]>();
  }

  getCanvasXMargin() {
    return 130;
  }

  getCanvasYMargin() {
    return 112;
  }

  getCanvasWidth() {
    return window.screen.availWidth - this.getCanvasXMargin();
  }

  getCanvasHeight() {
    return window.screen.availHeight - this.getCanvasYMargin();
  }

  getCircularPath(radius: number, centerX: number, centerY: number) {
    if (radius === undefined || centerX === undefined || centerY === undefined)
      throw new Error(
        "Cannot defined circular path as a parameter is missing."
      );

    let rx = -radius;
    let ry = -radius;
    return (
      "m " +
      centerX +
      ", " +
      centerY +
      " a " +
      rx +
      "," +
      ry +
      " 1 1,1 " +
      radius * 2 +
      ",0 a -" +
      radius +
      ",-" +
      radius +
      " 1 1,1 -" +
      radius * 2 +
      ",0"
    );
  }

  public getScreenCoordinates(x: any, y: any, matrix: any) {
    var xn = matrix.e + x * matrix.a + y * matrix.c;
    var yn = matrix.f + x * matrix.b + y * matrix.d;
    return { x: xn, y: yn };
  }

  public getContextMenuCoordinates(mouse:any, matrix:any) {
    let center = { x: window.pageXOffset, y: window.pageYOffset};
    return {
      x: this.getScreenCoordinates(center.x + mouse.x, center.y + mouse.y, matrix).x,
      y: this.getScreenCoordinates(center.x + mouse.x, center.y + mouse.y, matrix).y
    }
  }

  public clean() {
    this.d3
      .select("svg")
      .selectAll("*")
      .remove();
    this.d3.selectAll("div.arrow_box").remove();
  }

  // wrap(
  //   text: Selection<BaseType, {}, HTMLElement, any>,
  //   actualText: string,
  //   tags: Tag[],
  //   width: number,
  //   tagLineHeightRatio?: number
  // ) {
  //   let d3 = this.d3;
  //   let allSpacesRegex = /\t|\n|\r|\r\n|\u0020|\u00A0|\u1680|\u2000|\u2001|\u2002|\u2003|\u2004|\u2005|\u2006|\u2007|\u2008|\u2009|\u202A|\u202F|\u205F|\u3000/

  //   text.each(function () {
  //     let text = d3.select(this),
  //       words = actualText ? actualText.split(allSpacesRegex).reverse() : [],
  //       word: any,
  //       line: any[] = [],
  //       lineNumber = 0,
  //       lineHeight = 1.1, // ems
  //       y = text.attr("y"),
  //       x = text.attr("x"),
  //       dy = parseFloat(text.attr("dy")),
  //       tspan = text
  //         .text(null)
  //         .append("tspan")
  //         .attr("x", x)
  //         .attr("y", y)
  //         .attr("dy", dy + "em");
  //     while ((word = words.pop())) {
  //       line.push(word);
  //       tspan.text(line.join(" "));
  //       let node: SVGTSpanElement = <SVGTSpanElement>tspan.node();
  //       let hasGreaterWidth = node.getComputedTextLength() > width;
  //       if (hasGreaterWidth) {
  //         line.pop();
  //         tspan.text(line.join(" "));
  //         line = [word];
  //         tspan = text
  //           .append("tspan")
  //           .attr("x", x)
  //           .attr("y", y)
  //           .attr("dy", ++lineNumber * lineHeight + dy + "em")
  //           .text(word);
  //       }
  //     }
  //   });
  // }

  filter(
    selectedTags: any[],
    unselectedTags: any[],
    selection: any[]
  ): boolean {
    return isEmpty(selectedTags) // all tags are unselected by default
      ? true
      : isEmpty(selection) // the circle doesnt have any tags
        ? false
        : intersection(selectedTags.map(t => t.shortid), selection).length ===
          0
          ? false
          : true;
  }



  // getUserHtml(user: Helper, isSmall: boolean) {
  //   if (!user) return "<a ></a>";
  //   let formattedName = isSmall ? `<small>${user.name}</small>` : `${user.name}`
  //   return `<div>
  //             <button class="open-summary btn btn-link pl-0" data-shortid="${user.shortid}" data-slug="${user.getSlug()}">
  //               <img src="${user.picture}" alt="${user.name}" width="${isSmall ? 15 : 30}" height="${isSmall ? 15 : 30}" class="rounded-circle mr-1">${formattedName}
  //             </button>
  //             <small>${user.roles[0] ? this.markdown.compile(user.roles[0].description) : ""}</small>
  //           </div>`;
  // }

  // getTagsHtml(tags: Tag[]) {

  //   function getTagHtml(tag: Tag) {
  //     if (!tag) return;
  //     return `
  //     <li><span class="tag mr-1" style="color:${
  //       tag.color
  //       }">
  //             <i class="fa fa-tag mr-1" aria-hidden="true" style="color:${
  //       tag.color
  //       }"></i>${tag.name}
  //         </span></li>
  //     `
  //   }
  //   return tags
  //     .map(
  //       (tag: Tag) => getTagHtml(tag))
  //     .join("")

  // }

  // getInitiatveHTML(initiative: Initiative) {
  //   return `<h6 class="mb-1 lead d-flex justify-content-start"><button class="btn btn-link lead open-initiative text-left" id="${initiative.id}">${initiative.name}</button></h6>`
  // }

  // getTooltipHTML(initiative: Initiative): string {


  //   let accountableImg = this.getUserHtml(initiative.accountable, false)

  //   let helpersImg = initiative.helpers
  //     ? initiative.helpers
  //       .map((helper: Helper) => this.getUserHtml(helper, true))
  //       .join("")
  //     : "";

  //   return `
  //       <div class="card content">
  //         <div class="card-body">
  //           <a id="${initiative.id}" class="cursor-pointer underline open-initiative card-title">${initiative.name}</a>
  //           <p class="card-subtitle my-1">
  //             <ul class="tags small"> ${this.getTagsHtml(initiative.tags)}</ul>
  //           </p>
  //           <p class="card-text">
  //           ${accountableImg}
  //           </p>
  //           <p class="card-text">
  //           <small>${this.markdown.compile(initiative.description || "")}</small>
  //           </p>
  //           <p class="card-text">
  //           <small>${helpersImg}</small>
  //           </p>
  //         </div>
  //       </div>
  //         `;
  // }

  // getConnectionsHTML(initiatives: Initiative[], sourceUserId: string, targetUserId: string, connectionType: string) {
  //   let sourceUser = initiatives[0].getAllParticipants().find(
  //     h => h.user_id === sourceUserId
  //   );
  //   let targetUser = initiatives[0].getAllParticipants().find(
  //     h => h.user_id === targetUserId
  //   );
  //   let roles: { initiative: Initiative, role: Role }[] = [];
  //   initiatives.forEach(i => {
  //     let role = i.getAllParticipants().filter(h => h.user_id === sourceUserId)[0].roles[0];
  //     roles.push({ initiative: i, role: role });

  //   });

  //   let printInitiatives = roles.map(i =>
  //     `${this.getInitiatveHTML(i.initiative)}
  //     <ul class="tags small"> ${this.getTagsHtml(i.initiative.tags)}</ul>
  //     <small>${i.role ? "by" + this.markdown.compile(i.role.description || "") : ""}</small>
  //     `
  //   ).join("")



  //   return `
  //   <div class="content">
  //     <div class="d-inline-flex no-white-space">${this.getUserHtml(sourceUser, false)}<span class="m-2">${connectionType}</span> ${this.getUserHtml(targetUser, false)}</div>
  //     ${printInitiatives}
  //   </div>
  //   `

  // }
}
