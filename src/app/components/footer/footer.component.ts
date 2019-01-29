import { environment } from "./../../../environment/environment";
import { Component, Input} from "@angular/core";

@Component({
    selector: "footer",
    templateUrl: "./footer.component.html",
    styleUrls: ["./footer.component.css"]
})
export class FooterComponent {

    @Input("isMobile") isMobile:boolean;

    public TOS_URL: string = environment.TOS_URL
    public PRIVACY_URL: string = environment.PRIVACY_URL
    public BLOG_URL: string = environment.BLOG_URL;
    public today  = Date.now();

    constructor() { }
}