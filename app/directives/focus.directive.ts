import {Input, Directive, Inject, ElementRef} from '@angular/core'


@Directive({
    selector: '[focus]'
})
export class FocusDirective {
    @Input()
    focus:boolean;
    constructor(@Inject(ElementRef) private element: ElementRef) {}
    protected ngOnChanges() {
        this.element.nativeElement.focus();
    }
    protected ngOnInit(){
        this.element.nativeElement.blur();
    }
}