import {
    ElementRef,
    Directive, Input, TemplateRef,
    EventEmitter,
    Renderer2,
    Injector,
    ComponentFactoryResolver,
    ViewContainerRef,
    NgZone
} from "@angular/core";
import { NgbPopover, NgbPopoverConfig } from "@ng-bootstrap/ng-bootstrap";
import { ContentRef } from "@ng-bootstrap/ng-bootstrap/util/popup";

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
        ngZone: NgZone) {
        super(_elRef, _render, injector, componentFactoryResolver, viewContainerRef, config, ngZone);
        this.triggers = "manual"
        this.popoverTitle = "Permissions";
        this.container = "body"
    }
    ngOnInit(): void {
        super.ngOnInit();
        this.ngbPopover = this.stickyPopover;

        console.log(this.stickyPopover)


        this._render.listen(this._elRef.nativeElement, "mouseenter", () => {
            this.canClosePopover = true;
            // console.log("icon mouse enter", this.canClosePopover);
            this.open()
        });

        this._render.listen(this._elRef.nativeElement, "mouseleave", (event: Event) => {
            // console.log("icon mouse leave", this.canClosePopover);
            setTimeout(() => { if (this.canClosePopover) this.close() }, 100)

        })

        this._render.listen(this._elRef.nativeElement, "click", () => {
            // console.log("icon mouse click", this.canClosePopover);
            this.close();
        })
    }

    ngOnDestroy(): void {
        super.ngOnDestroy()
    }

    open() {
        // console.log("open")
        super.open();
        let popover = window.document.querySelector(".popover")
        this._render.listen(popover, "mouseover", () => {
            // console.log("popover mouse over", this.canClosePopover);
            this.canClosePopover = false;
        });

        this._render.listen(popover, "mouseout", () => {
            // console.log("popover mouse out", this.canClosePopover);
            this.canClosePopover = true;
            setTimeout(() => { if (this.canClosePopover) this.close() }, 0)
            // this.delayClose();
        });
    }

    close() {

        // console.log("close")
        super.close();
    }

    public delayClose() {
        // console.log("delay close")
        setTimeout(() => { if (this.canClosePopover) this.close() }, 2000)
    }
}