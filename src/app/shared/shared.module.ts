import { DebounceDirective } from './directives/debounce.directive';
import { StickyPopoverDirective } from "./directives/sticky.directive";
import { PermissionsDirective } from "./directives/permission.directive";
import { NgModule } from "@angular/core";
import { CreateMapComponent } from './components/create-map/create-map.component';
import { FormsModule, ReactiveFormsModule } from '../../../node_modules/@angular/forms';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { CardMapComponent } from './components/card-map/card-map.component';
import { RouterModule } from '@angular/router';



@NgModule({
    imports: [
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
        BrowserModule,
        RouterModule
    ],
    declarations: [
        PermissionsDirective,
        StickyPopoverDirective,
        DebounceDirective,
        CreateMapComponent,
        CardMapComponent
    ],
    providers: [
    ],
    exports: [
        PermissionsDirective,
        StickyPopoverDirective,
        DebounceDirective,
        CreateMapComponent,
        CardMapComponent
    ]
})
export class SharedModule { }