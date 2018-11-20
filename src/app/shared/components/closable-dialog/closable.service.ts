import { Injectable, ComponentFactoryResolver, ApplicationRef, Injector, EmbeddedViewRef, ComponentRef, Type } from '@angular/core';
import { ClosableComponent } from './closable.component';

@Injectable()
export class DialogService {
    closableComponentRef: ComponentRef<ClosableComponent>;

    constructor(private componentFactoryResolver: ComponentFactoryResolver, private appRef: ApplicationRef, private injector: Injector) { }

    private appendClosableComponentToBody() {
        const componentFactory = this.componentFactoryResolver.resolveComponentFactory(ClosableComponent);
        const componentRef = componentFactory.create(this.injector);
        this.appRef.attachView(componentRef.hostView);

        const domElem = (componentRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;
        document.body.appendChild(domElem);

        this.closableComponentRef = componentRef;
    }

    private removeClosableComponentFromBody() {
        this.appRef.detachView(this.closableComponentRef.hostView);
        this.closableComponentRef.destroy();
    }

    public open(componentType: Type<any>) {
        this.appendClosableComponentToBody();

        this.closableComponentRef.instance.childComponentType = componentType;
    }
}