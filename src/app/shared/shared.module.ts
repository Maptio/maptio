import { DebounceDirective } from './directives/debounce.directive';
import { StickyPopoverDirective } from "./directives/sticky.directive";
import { PermissionsDirective } from "./directives/permission.directive";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
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
        DebounceDirective
    ],
    providers: [
    ],
    exports: [
        PermissionsDirective,
        StickyPopoverDirective,
        DebounceDirective
    ]
})
export class SharedModule { }