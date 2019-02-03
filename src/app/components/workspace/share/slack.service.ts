import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DataSet } from '../../../shared/model/dataset.data';
import { Team } from '../../../shared/model/team.data';
import { RequestMethod, RequestOptions, Request, Headers } from "@angular/http";
import { AuthHttp } from "angular2-jwt/angular2-jwt";
import { Initiative } from '../../../shared/model/initiative.data';
import { SlackIntegration } from '../../../shared/model/integrations.data';

@Injectable()
export class SlackService {

    constructor(private http:AuthHttp) {

    }

    sendNotification(message: string, svg: HTMLElement, dataset:DataSet, team:Team): Observable<any> {
        // let svg = document.getElementById("map");
        let w = Number.parseFloat(svg.getAttribute("width"));
        let h = Number.parseFloat(svg.getAttribute("height"));
        svg.setAttribute("xmlns", "http://www.w3.org/2000/svg")
        svg.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink")
        let svgNode = this.downloadSvg(svg, "image.png", w, h);
        return this.sendSlackNotification((<any>svgNode).outerHTML, dataset.datasetId, dataset.initiative, team.slack, message)

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

    private getSnapshot(svgString: string, datasetId: string) {
        let headers = new Headers();
        headers.append("Content-Type", "text/html");
        headers.append("Accept", "text/html");
        let req = new Request({
            url: `/api/v1/images/upload/${datasetId}`,
            body: svgString,
            method: RequestMethod.Post,
            headers: headers
        });
        return this.http.request(req).map((responseData) => {
            return <string>responseData.json().eager[0].secure_url;
        })
    }

    private sendSlackNotification(svgString: string, datasetId: string, initiative: Initiative, slack: SlackIntegration, message: string) {
        return this.getSnapshot(svgString, datasetId)

            .map((imageUrl: string) => {
                let attachments = [
                    {
                        color: "#2f81b7",
                        pretext: message,
                        title: `Changes to ${initiative.name}`,
                        title_link: `https://app.maptio.com/map/${datasetId}/${initiative.getSlug()}/circles`,
                        image_url: imageUrl,
                        thumb_url: imageUrl,
                        footer: "Maptio",
                        footer_icon: "https://app.maptio.com/assets/images/logo-full.png",
                        // ts: Date.now()
                    }]

                let headers = new Headers();
                headers.append("Content-Type", "application/json");
                headers.append("Accept", "application/json");
                return new Request({
                    url: "/api/v1/notifications/send",
                    body: {
                        url: slack.incoming_webhook.url,
                        attachments: attachments
                    },
                    method: RequestMethod.Post,
                    headers: headers
                })
            })
            .mergeMap(req => this.http.request(req))
            .map(res => res.json())
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