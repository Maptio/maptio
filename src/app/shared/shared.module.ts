import { DebounceDirective } from './directives/debounce.directive';
import { StickyPopoverDirective } from "./directives/sticky.directive";
import { PermissionsDirective } from "./directives/permission.directive";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ClosableDirective } from './directives/closable.directive';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { MapSettingsService } from './services/map/map-settings.service';



@NgModule({
    imports: [
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
        RouterModule, 
        NgbPopoverModule
    ],
    declarations: [
        StickyPopoverDirective,
        DebounceDirective,
        ClosableDirective
    ],
    providers: [
        MapSettingsService
    ],
    exports: [
        StickyPopoverDirective,
        DebounceDirective,
        ClosableDirective,
        
    ]
})
export class SharedModule { }