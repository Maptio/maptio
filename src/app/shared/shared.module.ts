import { DebounceDirective } from './directives/debounce.directive';
import { StickyPopoverDirective } from "./directives/sticky.directive";
import { PermissionsDirective } from "./directives/permission.directive";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { ClosableDirective } from './directives/closable.directive';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';



@NgModule({
    imports: [
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
        BrowserModule,
        RouterModule, NgbPopoverModule
    ],
    declarations: [
        PermissionsDirective,
        StickyPopoverDirective,
        DebounceDirective,
        ClosableDirective
    ],
    providers: [
    ],
    exports: [
        PermissionsDirective,
        StickyPopoverDirective,
        DebounceDirective,
        ClosableDirective
    ]
})
export class SharedModule { }