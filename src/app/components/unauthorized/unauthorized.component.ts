import { Component, OnInit } from "@angular/core";

@Component({
    selector: "unauthorized",
    template: `
    <h5 class="m-3">You don't have permission to view this. Problems? Email us <b ><a class="text-success" href="mailto:support@maptio.com">support@maptio.com</a></b></h5>
    `
})
export class UnauthorizedComponent implements OnInit {
    constructor() { }

    ngOnInit() { }
}