import { DebounceDirective } from './directives/debounce.directive';
import { NgModule, ModuleWithProviders } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ClosableDirective } from './directives/closable.directive';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { MapSettingsService } from '../modules/workspace/services/map-settings.service';
import { PermissionService } from './model/permission.data';
import { MapService } from './services/map/map.service';
import { IntercomService } from './services/team/intercom.service';
import { JwtEncoder } from './services/encoding/jwt.service';
import { ErrorService } from './services/error/error.service';
import { ExportService } from './services/export/export.service';
import { FileService } from './services/file/file.service';
import { LoaderService } from './components/loading/loader.service';
import { MailingService } from './services/mailing/mailing.service';
import { URIService } from './services/uri/uri.service';
import { UserService } from './services/user/user.service';
import { BillingService } from './services/billing/billing.service';
import { TeamService } from './services/team/team.service';
import { FocusIfDirective } from './directives/focusif.directive';


@NgModule({
    imports: [
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
        RouterModule,
        NgbPopoverModule
    ],
    declarations: [
        DebounceDirective,
        ClosableDirective,
        FocusDirective
    ],
    exports: [
        DebounceDirective,
        ClosableDirective,
        FocusIfDirective

    ]
})
export class SharedModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: SharedModule,
            providers: [
                PermissionService,
                JwtEncoder,
                ErrorService,
                ExportService,
                FileService,
                LoaderService,
                MailingService,
                URIService,
                UserService,
                BillingService,
                TeamService,
                MapService,
                IntercomService
            ]
        };
    }

}