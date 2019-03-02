import { Location, LocationStrategy, PathLocationStrategy, APP_BASE_HREF } from "@angular/common";
import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { RouterModule } from "@angular/router";
import { AppComponent } from "./app.component";
import { CoreModule } from "./core/core.module";
import { AppRoutingModule } from "./app.routing";
import { AnalyticsModule } from "./core/analytics.module";
import { SharedModule } from "./shared/shared.module";
import { MarkdownModule, MarkedOptions, MarkedRenderer } from "ngx-markdown";
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";

export function markedOptionsFactory(): MarkedOptions {
    const renderer = new MarkedRenderer();

    renderer.link = (href: string, title: string, text: string) => {
        return `<a href=${href} class="markdown-link" target="_blank" title=${title}>${text}</a>`;
    }

    renderer.paragraph = (text: string) => {
        return `<p class="markdown">${text}</p>`;
    }

    renderer.listitem = (text: string) => {
        return text.includes("type=\"checkbox\"")
            ? `<li class="task-list-item">${text}</li>`
            : `<li>${text}</li>`
    }

    return {
        renderer: renderer,
        breaks: true,
        smartLists: true
    };
}

@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        // angular
        BrowserModule,
        BrowserAnimationsModule,
        // routing
        AppRoutingModule,
        // analytics
        AnalyticsModule,

        MarkdownModule.forRoot({
            markedOptions: {
                provide: MarkedOptions,
                useFactory: markedOptionsFactory,
            },
        }),

        // core & shared
        CoreModule,
        SharedModule.forRoot()
    ],
    exports: [RouterModule],
    providers: [
        BrowserAnimationsModule,
        Location,
        { provide: LocationStrategy, useClass: PathLocationStrategy },
        { provide: APP_BASE_HREF, useValue: '/' }
    ],
    entryComponents: [AppComponent],
    bootstrap: [AppComponent]
})

export class AppModule {

}

if ((module as any).hot) {
    (module as any).hot.accept();
    console.log('[HMR] Accepting module hot update.');
    const applicationTagName = 'maptio-app';
    tryRemoveApplicationNode(applicationTagName);
    tryBootstrapNewApplication(applicationTagName);
}

function tryRemoveApplicationNode(tagName:string) {
    const currentApplicationNode = document.getElementsByTagName(tagName)[0];
    if (currentApplicationNode) {
        const parent = currentApplicationNode.parentNode;
        parent.removeChild(currentApplicationNode);
    }
}

function tryBootstrapNewApplication(tagName:string) {
    const newNode = document.createElement(tagName);
    document.getElementsByTagName('body')[0].insertAdjacentElement('beforeend', newNode);

    const newAppModule = require('./app.module').AppModule;
    platformBrowserDynamic().bootstrapModule(newAppModule);
}