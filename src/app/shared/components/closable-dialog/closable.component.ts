import { Component, OnInit, Type, ViewChild, ComponentFactoryResolver, ComponentRef, ChangeDetectorRef } from '@angular/core';
import { InsertionDirective } from './insertion.directive';

@Component({
    selector: 'common-closable',
    templateUrl: './closable.component.html',
    styleUrls: ['./closable.component.css']
})
export class ClosableComponent implements OnInit {

    childComponentType: Type<any>;
    componentRef: ComponentRef<any>;

    @ViewChild(InsertionDirective) insertionPoint: InsertionDirective;

    constructor(private componentFactoryResolver: ComponentFactoryResolver, private cd: ChangeDetectorRef) { }

    ngOnInit() { }

    ngAfterViewInit() {
        this.loadChildComponent(this.childComponentType);
        this.cd.detectChanges();
    }

    ngOnDestroy() {
        if (this.componentRef) {
            this.componentRef.destroy();
        }
    }

    onOverlayClicked(evt: MouseEvent) {
        // close the dialog
    }

    onDialogClicked(evt: MouseEvent) {
        evt.stopPropagation();
    }

    loadChildComponent(componentType: Type<any>) {
        let componentFactory = this.componentFactoryResolver.resolveComponentFactory(componentType);

        let viewContainerRef = this.insertionPoint.viewContainerRef;
        viewContainerRef.clear();

        this.componentRef = viewContainerRef.createComponent(componentFactory);
    }
}
