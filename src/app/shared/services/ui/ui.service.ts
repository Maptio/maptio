import { Initiative } from "./../../model/initiative.data";
import { Injectable } from "@angular/core"
import { D3Service, D3, Selection, BaseType, HierarchyCircularNode } from "d3-ng2-service"
import { Observable } from "rxjs/Observable";
import { Subject } from "rxjs/Subject"
import "rxjs/add/operator/map";
import "rxjs/add/operator/toPromise";

@Injectable()
export class UIService {

    private d3: D3;

    // private tooltip$: Subject<[string, Initiative, Initiative]>

    constructor(d3Service: D3Service) {
        this.d3 = d3Service.getD3();
        // this.tooltip$ = new Subject<[string, Initiative, Initiative]>();
    }


    getCircularPath(radius: number, centerX: number, centerY: number) {
        if (radius === undefined || centerX === undefined || centerY === undefined)
            throw new Error("Cannot defined circular path as a parameter is missing.");

        let rx = -radius;
        let ry = -radius;
        return "m " + centerX + ", " + centerY + " a " + rx + "," + ry + " 1 1,1 " + radius * 2 + ",0 a -" + radius + ",-" + radius + " 1 1,1 -" + radius * 2 + ",0"
    }

    public clean() {
        this.d3.select("svg").selectAll("*").remove();
    }

    wrap(text: Selection<BaseType, {}, HTMLElement, any>, actualText: string, width: number) {
        let d3 = this.d3;
        text
            .each(function () {
                let text = d3.select(this),
                    words = actualText ? actualText.split(/\s+/).reverse() : [],
                    word: any,
                    line: any[] = [],
                    lineNumber = 0,
                    lineHeight = 1.1, // ems
                    y = text.attr("y"),
                    x = text.attr("x"),
                    dy = parseFloat(text.attr("dy")),
                    tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");
                while (word = words.pop()) {
                    line.push(word);
                    tspan.text(line.join(" "));
                    let node: SVGTSpanElement = <SVGTSpanElement>tspan.node();
                    let hasGreaterWidth = node.getComputedTextLength() > width;
                    if (hasGreaterWidth) {
                        line.pop();
                        tspan.text(line.join(" "));
                        line = [word];
                        tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
                    }
                }
            });
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
