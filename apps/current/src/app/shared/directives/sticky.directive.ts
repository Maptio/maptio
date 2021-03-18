import {
    ElementRef,
    Directive, Input, TemplateRef,
    EventEmitter,
    Renderer2,
    Injector,
    ComponentFactoryResolver,
    ViewContainerRef,
    NgZone, Inject, ChangeDetectorRef
} from "@angular/core";
import { NgbPopover, NgbPopoverConfig } from "@ng-bootstrap/ng-bootstrap";
import { DOCUMENT } from '@angular/common';

@Directive({
    selector: "[stickyPopover]",
    exportAs: "stickyPopover"
})
export class StickyPopoverDirective extends NgbPopover {
    @Input() stickyPopover: TemplateRef<any>;

    popoverTitle: string;

    placement: "auto" | "top" | "bottom" | "left" | "right" | "top-left" | "top-right" | "bottom-left" | "bottom-right" | "left-top" | "left-bottom" | "right-top" | "right-bottom" | ("auto" | "top" | "bottom" | "left" | "right" | "top-left" | "top-right" | "bottom-left" | "bottom-right" | "left-top" | "left-bottom" | "right-top" | "right-bottom")[];



    triggers: string;

    container: string;

    shown: EventEmitter<{}>;

    hidden: EventEmitter<{}>;

    toggle(): void {
        super.toggle()
    }

    isOpen(): boolean {
        return super.isOpen()
    }

    ngpPopover: TemplateRef<any>;

    canClosePopover: boolean;


    constructor(private _elRef: ElementRef, private _render: Renderer2, injector: Injector,
        componentFactoryResolver: ComponentFactoryResolver, private viewContainerRef: ViewContainerRef, config: NgbPopoverConfig,
        ngZone: NgZone, @Inject(DOCUMENT) _document: any, cd: ChangeDetectorRef) {
        super(_elRef, _render, injector, componentFactoryResolver, viewContainerRef, config, ngZone, _document, cd);
        this.triggers = "manual"
        this.container = "body";
        this.popoverClass = "permissions"

    }
    ngOnInit(): void {
        super.ngOnInit();
        this.ngbPopover = this.stickyPopover;

        this._render.listen(this._elRef.nativeElement, "mouseenter", () => {
            this.canClosePopover = true;
            this.open()
        });

        this._render.listen(this._elRef.nativeElement, "mouseleave", (event: Event) => {
            setTimeout(() => { if (this.canClosePopover) this.close() }, 200)

        })

        this._render.listen(this._elRef.nativeElement, "click", () => {
            this.close();
        })
    }

    ngOnDestroy(): void {
        super.ngOnDestroy()
    }

    open() {

        super.open();
        setTimeout(() => {
            const popover = window.document.querySelector('.popover');
            this._render.listen(popover, 'mouseover', () => {
                this.canClosePopover = false;
            });

            this._render.listen(popover, 'mouseout', () => {
                this.canClosePopover = true;
                setTimeout(() => { if (this.canClosePopover) { this.close(); } }, 0);
            });
        }, 0);
    }

    close() {
        super.close();
    }

    public delayClose() {
        setTimeout(() => { if (this.canClosePopover) this.close() }, 2000)
    }
}