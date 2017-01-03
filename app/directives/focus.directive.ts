import { Input, Directive, Inject, ElementRef, OnInit, OnChanges } from '@angular/core'


@Directive({
    selector: '[focus]'
})
export class FocusDirective implements OnChanges, OnInit {
    @Input()
    focus: boolean;
    constructor( @Inject(ElementRef) private element: ElementRef) { }
    public ngOnChanges() {
        this.element.nativeElement.focus();
    }
    public ngOnInit() {
        this.element.nativeElement.blur();
    }
}