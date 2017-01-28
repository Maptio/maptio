import { Input, Directive, Inject, ElementRef, OnInit, OnChanges } from '@angular/core'


@Directive({
    selector: '[focus]'
})
export class FocusDirective implements OnChanges, OnInit {
    @Input()
    focus: boolean;

    constructor( @Inject(ElementRef) private element: ElementRef) { }
    public ngOnChanges() {
       
        this.applyFocus();
        //this.element.nativeElement.focus();
    }
    public ngOnInit() {
        this.applyFocus();
        //this.element.nativeElement.blur();
    }

    private applyFocus(){
        if(this.focus == true){
            this.element.nativeElement.focus();
            this.element.nativeElement.style.cssText = " { color: red; }";
        }else{
            this.element.nativeElement.blur();
        }
    }
    
}