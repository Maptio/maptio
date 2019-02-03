import "file-saver"


import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { RouterModule } from '../../../../node_modules/@angular/router';
import { SanitizerModule } from '../../shared/sanitizer.module';
import { ReactiveFormsModule } from '../../../../node_modules/@angular/forms';
import { ConfirmationPopoverModule } from '../../../../node_modules/angular-confirmation-popover';
import { PermissionsModule } from '../../shared/permissions.module';
import { AccountComponent } from "../account/account.component";
import { ImageModule } from "../../shared/image.module";
import { AuthGuard } from "../../shared/services/guards/auth.guard";
import { CreateMapModule } from "../../shared/create-map.module";

@NgModule({
    declarations: [
        HomeComponent,
        DashboardComponent,
        AccountComponent
        
    ],
    imports: [CommonModule,
        ReactiveFormsModule,
        PermissionsModule,
        ImageModule,CreateMapModule,
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