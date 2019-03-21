import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ExportService } from '../../../../shared/services/export/export.service';
import { DataSet } from '../../../../shared/model/dataset.data';
import { Team } from '../../../../shared/model/team.data';

@Injectable()
export class SlackService {

    constructor(private exportService: ExportService) {

    }

    sendNotification(message: string, svg: HTMLElement, dataset: DataSet, team: Team): Observable<any> {
        let g = svg.childNodes[0] as SVGElement;
        let w = g.getBoundingClientRect().width;
        let h = g.getBoundingClientRect().height;
        svg.setAttribute("xmlns", "http://www.w3.org/2000/svg")
        svg.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink")
        let svgNode = this.downloadSvg(svg, "image.png", w, h) as SVGElement;
        svgNode.setAttribute("width", `${w+20}px`);
        svgNode.setAttribute("height", `${h+20}px`);
        svgNode.setAttribute("x", `-${50}%`);
        
        return this.exportService.sendSlackNotification((<any>svgNode).outerHTML, dataset.datasetId, dataset.initiative, team.slack, message)

    }

    private downloadSvg(svg: HTMLElement, fileName: string, width: number, height: number): Node {
        let copy = svg.cloneNode(true);
        this.copyStylesInline(copy, svg);
        return copy;
    }

    private copyStylesInline(destinationNode: any, sourceNode: any) {
        let containerElements = ["svg", "g"];
        for (let cd = 0; cd < destinationNode.childNodes.length; cd++) {
            let child = destinationNode.childNodes[cd];

            if (child.tagName === "foreignObject") {
                if (child.childNodes[0].tagName === "DIV") {
                    child.childNodes[0].setAttribute("xmlns", "http://www.w3.org/1999/xhtml")
                }
            }

            if (containerElements.indexOf(child.tagName) !== -1) {
                this.copyStylesInline(child, sourceNode.childNodes[cd]);
                continue;
            }
            let style = sourceNode.childNodes[cd].currentStyle || window.getComputedStyle(sourceNode.childNodes[cd]);
            if (style === "undefined" || style == null) continue;
            for (let st = 0; st < style.length; st++) {
                if (style[st] === "display" && style.getPropertyValue(style[st]) === "none") {
                    child.style.setProperty(style[st], "block");

                }
                else if (style[st] === "opacity" && style.getPropertyValue(style[st]) === "0") {
                    child.style.setProperty(style[st], "1");
                }
                // else if (style["fill"].includes("url(")) {
                //   child.style.setProperty("display", "none")
                // }
                else {
                    child.style.setProperty(style[st], style.getPropertyValue(style[st]));
                }
                // child.style.setProperty(style[st], style.getPropertyValue(style[st]));
            }
        }
    }


    // print() {
    //   // the canvg call that takes the svg xml and converts it to a canvas
    //   canvg("canvas", document.getElementById("svg_circles").outerHTML);

    //   // the canvas calls to output a png
    //   let canvas = document.getElementById("canvas");
    //   canvas.setAttribute("width", `${this.VIEWPORT_WIDTH}px`);
    //   canvas.setAttribute("height", `${this.VIEWPORT_HEIGHT}px`);
    //   let img = canvas.toDataURL("image/png");
    //   document.write("<img src=\"" + img + "\"/>");
    // }


    // print() {
    //   this.isPrinting = true;
    //   this.cd.markForCheck()
    //   this.zoom$.next(0.8);
    //   this.changeFontSize(1)

    //   let svg = document.getElementById("svg_circles");
    //   let w = Number.parseFloat(svg.getAttribute("width"));
    //   let h = Number.parseFloat(svg.getAttribute("height"));
    //   svg.setAttribute("xmlns", "http://www.w3.org/2000/svg")
    //   svg.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink")
    //   let svgNode = this.downloadSvg(svg, "image.png", w, h);
    //   this.exportService.sendSlackNotification(svgNode.outerHTML, this.datasetId, this.datasetName, this.team.slack)
    //     .subscribe(() => { this.isPrinting = false; this.cd.markForCheck() })

    // }



    //   triggerDownload(imgURI: string, fileName: string) {
    //     let evt = new MouseEvent("click", {
    //       view: window,
    //       bubbles: false,
    //       cancelable: true
    //     });
    //     let a = document.createElement("a");
    //     a.setAttribute("href", imgURI);
    //     a.setAttribute("target", "_blank");
    //     a.dispatchEvent(evt);
    //   }
}