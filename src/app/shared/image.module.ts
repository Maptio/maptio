import "@cloudinary/angular-5.x";
import "cloudinary-core";
import "ng2-file-upload";

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CloudinaryModule } from "@cloudinary/angular-5.x";
import { Cloudinary } from "cloudinary-core";
import { environment } from '../../environment/environment';
import { FileUploadModule } from 'ng2-file-upload';

export const cloudinaryLib = {
    Cloudinary: Cloudinary
};


@NgModule({
    declarations: [
        
    ],
    imports: [CommonModule,
        FileUploadModule,
        CloudinaryModule.forRoot(cloudinaryLib, { cloud_name: environment.CLOUDINARY_CLOUDNAME, upload_preset: environment.CLOUDINARY_UPLOAD_PRESET }),
    ],
    exports: [FileUploadModule],
    providers: [],
})
export class ImageModule { }