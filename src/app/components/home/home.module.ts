import "file-saver"


import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { RouterModule } from '../../../../node_modules/@angular/router';
import { SanitizerModule } from '../../shared/sanitizer.module';
import { CardMapComponent } from '../../shared/components/card-map/card-map.component';
import { CreateMapComponent } from '../../shared/components/create-map/create-map.component';
import { ReactiveFormsModule } from '../../../../node_modules/@angular/forms';
import { ConfirmationPopoverModule } from '../../../../node_modules/angular-confirmation-popover';
import { PermissionsModule } from '../../shared/permissions.module';
import { AccountComponent } from "../account/account.component";
import { ImageModule } from "../../shared/image.module";
import { AuthGuard } from "../../shared/services/guards/auth.guard";

@NgModule({
    declarations: [
        HomeComponent,
        DashboardComponent,
        CardMapComponent,
        CreateMapComponent,
        AccountComponent
        
    ],
    imports: [CommonModule,
        ReactiveFormsModule,
        ConfirmationPopoverModule,
        PermissionsModule,
        ImageModule,
        // CommonComponentsModule,
        SanitizerModule,
        RouterModule.forChild([
            {
                path: "", component : HomeComponent,
            },
            {
                path: ":shortid/:slug",
                component: AccountComponent,
                canActivate: [AuthGuard],
                data: { breadcrumbs: "Profile" }
            },
        ])],
    exports: [],
    providers: [],
})
export class HomeModule { }