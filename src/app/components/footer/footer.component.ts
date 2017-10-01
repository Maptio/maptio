import { environment } from "./../../../environment/environment";
import { Component, OnInit } from "@angular/core";

@Component({
    selector: "footer",
    templateUrl: "./footer.component.html",
    styleUrls: ["./footer.component.css"]
})
export class FooterComponent {

    public TOS_URL: string = environment.TOS_URL
    public PRIVACY_URL: string = environment.PRIVACY_URL
    public BLOG_URL: string = environment.BLOG_URL;

    constructor() { }
}