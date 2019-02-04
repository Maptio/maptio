
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";
import { enableProdMode } from "@angular/core";
import { AppModule } from "./app/app.module";


import './assets/styles/custom/animations.css'
import './assets/styles/custom/global.css'
import './assets/styles/custom/angular-tree-component.css'
import './assets/styles/custom/tooltip.css'
import './assets/styles/custom/tags.css'
import './assets/styles/custom/markdown.css'
import './assets/styles/custom/progress-bar.css'
import './assets/styles/custom/ribbon.css'
import './assets/styles/custom/popover.css'
import './assets/styles/custom/color-picker.css'
import './assets/styles/custom/maps.css'
import './assets/styles/custom/breadcrumb.css'


if (process.env.NODE_ENV === "production") {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .then(() => {
    console.log("App started")
  })
  .catch(err => console.error(err));
