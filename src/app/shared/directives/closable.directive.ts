import { Directive, ElementRef, Renderer2 } from '@angular/core';

@Directive({
    selector: '[closable]'
})
export class ClosableDirective {
    constructor(elr: ElementRef, private renderer: Renderer2) {
        // elr.nativeElement.style.background = 'red';
//<i class="far fa-window-close"></i>
        let i = renderer.createElement("i");
        renderer.addClass(i, "fas");
        renderer.addClass(i, "fa-times");

        let div = renderer.createElement("span");
        renderer.addClass(div, "position-absolute");
        renderer.addClass(div, "cursor-pointer");
        renderer.addClass(div, "text-muted");
        renderer.addClass(div, "top-right");
        renderer.addClass(div, "p-2");
        // renderer.addClass(div, "bg-dark");

        renderer.appendChild(div, i);

        renderer.listen(div, "click", (event:any)=>{
           renderer.removeClass(elr.nativeElement, "show")
        });


        renderer.appendChild(elr.nativeElement, div);


    }
}