import { ViewContainerRef, Directive, ComponentFactoryResolver, ComponentRef, ComponentFactory } from '@angular/core'


@Directive({ selector: '[anchor]' })
export class AnchorDirective {
    constructor(
        private viewContainer: ViewContainerRef,
        private componentFactoryResolver: ComponentFactoryResolver
    ) { }

    createComponent<T>(factory: ComponentFactory<T>): ComponentRef<T> {
        //console.log(factory);
        this.viewContainer.clear();
        return this.viewContainer.createComponent(factory);
    }
}