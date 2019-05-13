import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ExportService } from '../../../../shared/services/export/export.service';
import { DataSet } from '../../../../shared/model/dataset.data';
import { Team } from '../../../../shared/model/team.data';
import { User } from '../../../../shared/model/user.data';

@Injectable()
export class SlackService {

    constructor(private exportService: ExportService) {

    }

    // sendNotification(message: string, svg: HTMLElement, dataset: DataSet, team: Team): Observable<any> {
    //     let g = svg.childNodes[0] as SVGElement;
    //     let w = g.getBoundingClientRect().width;
    //     let h = g.getBoundingClientRect().height;
    //     svg.setAttribute("xmlns", "http://www.w3.org/2000/svg")
    //     svg.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink")
    //     let svgNode = this.downloadSvg(svg, "image.png", w, h) as SVGElement;
    //     svgNode.setAttribute("width", `${w + 20}px`);
    //     svgNode.setAttribute("height", `${h + 20}px`);
    //     (svgNode.childNodes[0] as SVGElement).setAttribute("transform", `translate(${w / 2},${h / 2}) scale(0.95)`)
    //     return this.exportService.sendSlackNotification((<any>svgNode).outerHTML, dataset.datasetId, dataset.initiative, team.slack, message)

    // }

    public downloadSvg(svg: HTMLElement, users: User[]): Node {
        let copy = svg.cloneNode(true);
        this.copyStylesInline(copy, svg, users);
        return copy;
    }

    public copyStylesInline(destinationNode: any, sourceNode: any, users: User[]) {
        let containerElements = ["svg", "g", "foreignobject", "div"];
        let ignoreElements = ["text"]
        for (let cd = 0; cd < destinationNode.childNodes.length; cd++) {
            let child= destinationNode.childNodes[cd];
            
            if (child.nodeType === 3) {
                continue;
            }

            let style = sourceNode.childNodes[cd].currentStyle || window.getComputedStyle(sourceNode.childNodes[cd]);
            if (style === "undefined" || style == null) continue;
            for (let st = 0; st < style.length; st++) {
                child.style.setProperty(style[st], style.getPropertyValue(style[st]));
            }


            if (child.tagName.toLowerCase() === "foreignobject") {
                if (child.childNodes[0].tagName === "DIV") {
                    child.childNodes[0].setAttribute("xmlns", "http://www.w3.org/1999/xhtml");

                }
            }

            if (child.tagName.toLowerCase() === "div") {
                child.style.setProperty("font-family", "Helvetica");
                child.style.setProperty("opacity", "1");
                child.style.setProperty("display", "flex");
            }

            if (child.tagName.toLowerCase() === "span") {
                if (child.classList.contains("member-picture")) {
                    let shortid = child.getAttribute("data-member-shortid");
                    if (shortid) {
                        let user = users.filter(u => u.shortid === shortid)[0];
                        child.style.setProperty("background-image", `url(${user.base64Picture})`);
                    }
                }
            }


            this.copyStylesInline(child, sourceNode.childNodes[cd], users);
           
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