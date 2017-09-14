import { Component, OnInit } from "@angular/core";

@Component({
    selector: "footer",
    template: require("./footer.component.html"),
    styleUrls: ["./footer.component.css"]
})
export class FooterComponent implements OnInit {


    public TOS_URL: string = "https://termsfeed.com/terms-conditions/f0e548940bde8842b1fb58637ae048c0"
    public PRIVACY_URL: string = "https://termsfeed.com/privacy-policy/61f888ebea93b0029582b88a7be1e1e3"

    constructor() { }

    ngOnInit() { }
}