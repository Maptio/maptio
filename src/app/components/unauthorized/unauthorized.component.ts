import { Component, OnInit } from "@angular/core";

@Component({
    selector: "unauthorized",
    template: `
    <h4 class="m-3">You don't have permission to view this. Problems? Email us support@maptio.com</h4>
    `
})
export class UnauthorizedComponent implements OnInit {
    constructor() { }

    ngOnInit() { }
}