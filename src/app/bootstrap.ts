
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";
import { enableProdMode } from "@angular/core";
import { AppModule } from "./app.module";

import '../../public/styles/animations.css'
import '../../public/styles/global.css'
import '../../public/styles/angular-tree-component.css'
import '../../public/styles/tooltip.css'
import '../../public/styles/breadcrumb.css'
import '../../public/styles/tags.css'
import '../../public/styles/markdown.css'
import '../../public/styles/collapsing.css'
import '../../public/styles/progress-bar.css'
import '../../public/styles/ribbon.css'
import '../../public/styles/progress-pie.css'
import '../../public/styles/popover.css'
import '../../public/styles/color-picker.css'
import '../../public/styles/maps.css'

if (process.env.NODE_ENV === "production") {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule);
