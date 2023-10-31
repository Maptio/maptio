import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

import { Cloudinary } from '@cloudinary/url-gen';
import { CloudinaryModule } from '@cloudinary/ng';
import {
  FileUploaderOptions,
  FileUploader,
  FileLikeObject,
  FileUploadModule,
} from 'ng2-file-upload';

import { environment } from '@maptio-config/environment';
import { NgIf } from '@angular/common';

@Component({
  selector: 'maptio-image-upload',
  templateUrl: './image-upload.component.html',
  styleUrls: ['./image-upload.component.scss'],
  standalone: true,
  imports: [NgIf, FileUploadModule, CloudinaryModule],
})
export class ImageUploadComponent implements OnInit {
  public uploader: FileUploader;
  private uploaderOptions: FileUploaderOptions = {
    url: `https://api.cloudinary.com/v1_1/${environment.CLOUDINARY_CLOUDNAME}/upload`,
    // Upload files automatically upon addition to upload queue
    autoUpload: true,
    // Use xhrTransport in favor of iframeTransport
    isHTML5: true,
    // Maximum file size allowed for upload
    maxFileSize: 1024000 * 2, // 2 MB
    // Calculate progress independently for each uploaded file
    removeAfterUpload: true,
    // XHR request headers
    headers: [
      {
        name: 'X-Requested-With',
        value: 'XMLHttpRequest',
      },
    ],
  };

  private cloudinary: Cloudinary;
  private cloudinaryOptions = {
    cloud: {
      cloudName: environment.CLOUDINARY_CLOUDNAME,
    },
  };

  public isRefreshingPicture: boolean;

  @Input() imageUrl: string;
  @Input() userId: string;
  @Output() uploadedImageUrl = new EventEmitter<string>();
  @Output() errorMessage = new EventEmitter<string>();

  constructor() {}

  ngOnInit(): void {
    this.uploader = new FileUploader(this.uploaderOptions);
    this.cloudinary = new Cloudinary(this.cloudinaryOptions);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.uploader.onBuildItemForm = (fileItem: any, form: FormData): any => {
      this.buildItemForm(fileItem, form);
    };

    this.uploader.onWhenAddingFileFailed = (
      item: FileLikeObject,
      filter: any // eslint-disable-line @typescript-eslint/no-explicit-any
    ) => {
      this.handleError(item, filter);
    };

    this.uploader.onCompleteItem = (
      item: any, // eslint-disable-line @typescript-eslint/no-explicit-any
      response: string
    ) => {
      try {
        const pictureURL = JSON.parse(response).secure_url;

        if (!pictureURL) {
          throw new Error();
        }

        this.updatePicture(pictureURL);
      } catch {
        this.errorMessage.emit(
          $localize`Image upload was unsuccessful, please try again later.`
        );
      }

      this.isRefreshingPicture = false;
    };

    this.uploader.onProgressItem = () => {
      this.isRefreshingPicture = true;
    };

    this.uploader.onErrorItem = (error) => {
      // TODO: This never seems to fire, even when errors clearly occur, how
      // to better handle errors from this library?
      console.error(error);
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private handleError(item: FileLikeObject, filter: any) {
    if (filter.name === 'fileSize') {
      this.errorMessage.emit($localize`The image size must not exceed 2 MB.`);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private buildItemForm(fileItem: any, form: FormData): any {
    this.isRefreshingPicture = true;
    this.errorMessage.emit('');

    // This prevents an ugly bug - when user isn't passed in - that doesn't
    // even show up as an error in the console and so is hard to reproduce.
    // Apparently, something prevents errors from this function from
    // propagating so it's impossible to handle them. Would be good to dig into
    // this a bit more deeply, surely the library provides functionality for
    // better error handling? (TODO)
    let userId = 'user-id-not-yet-set';
    if (this.userId) {
      userId = this.userId;
    }

    // Add Cloudinary's unsigned upload preset to the upload form
    form.append('upload_preset', environment.CLOUDINARY_UPLOAD_PRESET);
    // Add built-in and custom tags for displaying the uploaded photo in the list
    form.append('context', `user_id=${encodeURIComponent(userId)}`);
    form.append('tags', environment.CLOUDINARY_PROFILE_TAGNAME);
    form.append('file', fileItem);

    // Use default "withCredentials" value for CORS requests
    fileItem.withCredentials = false;

    return { fileItem, form };
  }

  updatePicture(imageUrl: string) {
    this.imageUrl = imageUrl;
    this.uploadedImageUrl.emit(this.imageUrl);
  }
}
