import { Injectable } from "@angular/core";
import { D3Service, D3, Selection, BaseType } from "d3-ng2-service";
import "rxjs/add/operator/map";
import "rxjs/add/operator/toPromise";
import { Tag } from "../../model/tag.data";
import * as _ from "lodash";
import { Initiative } from "../../model/initiative.data";
import { Helper } from "../../model/helper.data";
import { MarkdownService } from "angular2-markdown";
import { Role } from "src/app/shared/model/role.data";
import { User } from "src/app/shared/model/user.data";

@Injectable()
export class UIService {
  private d3: D3;

  // private tooltip$: Subject<[string, Initiative, Initiative]>

  constructor(d3Service: D3Service, private markdown: MarkdownService) {
    this.d3 = d3Service.getD3();
    // this.tooltip$ = new Subject<[string, Initiative, Initiative]>();
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

  public clean() {
    this.d3
      .select("svg")
      .selectAll("*")
      .remove();
    this.d3.selectAll("div.arrow_box").remove();
  }

  wrap(
    text: Selection<BaseType, {}, HTMLElement, any>,
    actualText: string,
    tags: Tag[],
    width: number,
    tagLineHeightRatio?: number
  ) {
    let d3 = this.d3;

    text.each(function () {
      let text = d3.select(this),
        words = actualText ? actualText.split(/\s+/).reverse() : [],
        word: any,
        line: any[] = [],
        lineNumber = 0,
        lineHeight = 1.1, // ems
        y = text.attr("y"),
        x = text.attr("x"),
        dy = parseFloat(text.attr("dy")),
        tspan = text
          .text(null)
          .append("tspan")
          .attr("x", x)
          .attr("y", y)
          .attr("dy", dy + "em");
      while ((word = words.pop())) {
        line.push(word);
        tspan.text(line.join(" "));
        let node: SVGTSpanElement = <SVGTSpanElement>tspan.node();
        let hasGreaterWidth = node.getComputedTextLength() > width;
        if (hasGreaterWidth) {
          line.pop();
          tspan.text(line.join(" "));
          line = [word];
          tspan = text
            .append("tspan")
            .attr("x", x)
            .attr("y", y)
            .attr("dy", ++lineNumber * lineHeight + dy + "em")
            .text(word);
        }
      }

      // tags.forEach((tag: Tag, index: number) => {
      //   text
      //     .append("tspan")
      //     .attr("x", x)
      //     .attr("y", y)
      //     .attr(
      //       "dy",
      //       (lineNumber + 1) * (lineHeight * (tagLineHeightRatio || 1)) +
      //         dy +
      //         "em"
      //     )
      //     .attr("dx", index * 20)
      //     .attr("class", "dot-tags")
      //     .attr("fill", tag.color)
      //     .html("&#xf02b");
      // });
    });
  }

  filter(
    selectedTags: any[],
    unselectedTags: any[],
    selection: any[]
  ): boolean {
    return _.isEmpty(selectedTags) // all tags are unselected by default
      ? true
      : _.isEmpty(selection) // the circle doesnt have any tags
        ? false
        : _.intersection(selectedTags.map(t => t.shortid), selection).length ===
          0
          ? false
          : true;
  }

  getConnectionsHTML(initiatives: Initiative[], sourceUserId: string) {
    console.log(initiatives, sourceUserId, initiatives[0].helpers)
    let sourceUser = initiatives[0].helpers.find(
      h => h.user_id === sourceUserId
    );
    let targetUser = initiatives[0].accountable;

    let roles: { initiative: Initiative, role: Role }[] = [];
    initiatives.forEach(i => {
      let role = i.helpers.filter(h => h.user_id === sourceUserId)[0].roles[0];
      roles.push({ initiative: i, role: role });
    });

    let printInitiatives = roles.map(i =>
      `<h6 class="mb-1 lead"><button class="btn btn-link lead open-initiative" id="${i.initiative.id}">${i.initiative.name}</button></h6>
      <small>by ${i.role ? this.markdown.compile(i.role.description || "") : ""}</small>
      `
    ).join("")



    return `
    <div class="content">
      <div class="d-inline-flex no-white-space">${this.getUserHtml(sourceUser, false)}<span class="m-2">helps</span> ${this.getUserHtml(targetUser, false)}</div>
      ${printInitiatives}
    </div>
    `

  }

  getUserHtml(user: User, isSmall: boolean) {
    if (!user) return "<a ></a>";
    let formattedName = isSmall ? `<small>${user.name}</small>` : `${user.name}`
    return `<button class="open-summary btn btn-link pl-0" data-shortid="${user.shortid}" data-slug="${user.getSlug()}">
            <img src="${user.picture}" width="${isSmall ? 15 : 30}" height="${isSmall ? 15 : 30}" class="rounded-circle mr-1">${formattedName}
        </button>`;
  }

  getTagHtml(tag: Tag) {
    if (!tag) return;
    return `
    <li><a class="btn btn-sm btn-secondary borderless mr-1 tag" style="color:${
      tag.color
      }">
            <i class="fa fa-tag mr-1" aria-hidden="true" style="color:${
      tag.color
      }"></i>${tag.name}
        </a></li>
    `
  }

  getTooltipHTML(initiative: Initiative): string {
    let tagsSpan = initiative.tags
      ? initiative.tags
        .map(
        (tag: Tag) => this.getTagHtml(tag))
        .join("")
      : "";

    let accountableImg = this.getUserHtml(initiative.accountable, false)

    let helpersImg = initiative.helpers
      ? initiative.helpers
        .map((helper: Helper) => this.getUserHtml(helper, true))
        .join("")
      : "";

    return `
        <div class="content">
          <h6 class="mb-1 lead"><button class="btn btn-link lead open-initiative" id="${initiative.id}">${initiative.name}</button></h6>
          <ul class="tags small"> ${tagsSpan}</ul>
          <div class="mb-0 p-0 ml-0">${accountableImg}</div>
          <div class="row pl-3 mb-2 d-flex justify-content-start" >${helpersImg}</div>
          <small>${this.markdown.compile(initiative.description || "")}</small>
        </div>
          `;
  }

  /*
    adjustLabels(textNodes: Selection<BaseType, HierarchyCircularNode<{}>, BaseType, {}>, k: number) {
        let d3 = this.d3;
        textNodes
            .text(function (d: any) { return d.data.name })
            .each(function (d: any, i: number) {

                d.pathLength = (<SVGPathElement>d3.select("#path" + d.data.id).node()).getTotalLength();
                d.tw = (<any>d3.select(this).node()).getComputedTextLength()
                d.radius = d.r * k;
               let maxLength = 2 / 5 * d.pathLength;
                let proposedLabel = d.data.name;
                let proposedLabelArray = proposedLabel.split("");

               while ((d.tw > maxLength && proposedLabelArray.length)) {
                   proposedLabelArray.pop(); proposedLabelArray.pop(); proposedLabelArray.pop();
                    if (proposedLabelArray.length === 0) {
                        proposedLabel = "";
                    } else {
                        proposedLabel = proposedLabelArray.join("") + "..."; // manually truncate with ellipsis
                    }
                    d3.select(this).text(proposedLabel);

                    d.tw = (<any>d3.select(this).node()).getComputedTextLength();
                }
                // }
            });
    }
*/
}
