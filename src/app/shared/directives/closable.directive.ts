import { Directive, ElementRef, Renderer2 } from '@angular/core';

@Directive({
    selector: '[closable]'
})
export class ClosableDirective {
    constructor(elr: ElementRef, private renderer: Renderer2) {
        let i = renderer.createElement("i");
        renderer.addClass(i, "fas");
        renderer.addClass(i, "fa-times");

        let closingSpan = renderer.createElement("span");
        renderer.addClass(closingSpan, "position-absolute");
        renderer.addClass(closingSpan, "cursor-pointer");
        renderer.addClass(closingSpan, "text-muted");
        renderer.addClass(closingSpan, "top-right");
        renderer.addClass(closingSpan, "p-2");
        // renderer.addClass(div, "bg-dark");

        renderer.appendChild(closingSpan, i);

        renderer.listen(closingSpan, "click", (event: any) => {
            renderer.removeClass(elr.nativeElement, "show")
        });

        renderer.listen("body", "click", (event: Event) => {
            if (event.path.filter((p: Element) => p.classList && p.classList.contains("closable")).length > 0) {
                // the clicked element is inside a 'closable' element, do nothing
            }
            else {
                 // the clicked element is outside a 'closable' element, close only if it is not a menu item
                if (!(<Element>event.target).classList.contains("menu") && !(<Element>(<Element>event.target).parentNode).classList.contains("menu")) {
                    renderer.removeClass(elr.nativeElement, "show")
                }
            }
        })
        renderer.addClass(elr.nativeElement, "closable");
        renderer.appendChild(elr.nativeElement, closingSpan);
    }
}