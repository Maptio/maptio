import { Directive, ElementRef, HostListener } from "@angular/core"


@Directive({
    selector: "[autoselect]"
})
export class AutoSelectDirective {

    constructor(private el: ElementRef) { }

    @HostListener("click") onclick() {
        this.el.nativeElement.setSelectionRange(0, this.el.nativeElement.value.length);
    }
}
