import { Component, Input} from "@angular/core";

import { environment } from "@maptio-environment";
import { environment as config } from "@maptio-config/environment";

@Component({
    selector: "footer",
    templateUrl: "./footer.component.html",
    styleUrls: ["./footer.component.css"]
})
export class FooterComponent {

    @Input("isMobile") isMobile:boolean;

    public TERMS_AND_CONDITIONS_URL: string = environment.TERMS_AND_CONDITIONS_URL
    public PRIVACY_POLICY_URL: string = environment.PRIVACY_POLICY_URL
    public BLOG_URL: string = config.BLOG_URL;
    public WIKI_URL: string = config.WIKI_URL;
    public today  = Date.now();

    constructor() { }
}
