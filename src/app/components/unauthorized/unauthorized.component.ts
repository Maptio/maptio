import { Component, OnInit } from "@angular/core";

@Component({
    selector: "unauthorized",
    template: `
    <h4 class="m-3">We don't think you should be allowed here. You disagree ? Email us support@maptio.com</h4>
    `
})
export class UnauthorizedComponent implements OnInit {
    constructor() { }

    ngOnInit() { }
}