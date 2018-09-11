import { DebounceDirective } from './directives/debounce.directive';
import { StickyPopoverDirective } from "./directives/sticky.directive";
import { PermissionsDirective } from "./directives/permission.directive";
import { NgModule } from "@angular/core";
import { CreateMapComponent } from './components/create-map/create-map.component';
import { FormsModule, ReactiveFormsModule } from '../../../node_modules/@angular/forms';
import { CommonModule } from '../../../node_modules/@angular/common';
import { BrowserModule } from '../../../node_modules/@angular/platform-browser';



@NgModule({
    imports: [
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
        BrowserModule
    ],
    declarations: [
        PermissionsDirective,
        StickyPopoverDirective,
        DebounceDirective,
        CreateMapComponent
    ],
    providers: [
    ],
    exports: [
        PermissionsDirective,
        StickyPopoverDirective,
        DebounceDirective,
        CreateMapComponent
    ]
})
export class SharedModule { }