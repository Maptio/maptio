import { environment } from "./../../../environment/environment";
import { UserService } from "./../../shared/services/user/user.service";
import { ErrorService } from "./../../shared/services/error/error.service";
import { Auth } from "./../../shared/services/auth/auth.service";
import { Subscription } from "rxjs/Rx";
import { User } from "./../../shared/model/user.data";
import { Component } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { Cloudinary } from "@cloudinary/angular-4.x";
import { FileUploaderOptions, FileUploader, ParsedResponseHeaders, FileLikeObject } from "ng2-file-upload";
import { UserFactory } from "../../shared/services/user.factory";

@Component({
    selector: "account",
    templateUrl: "./account.component.html",
    styleUrls: ["./account.component.css"]
})
export class AccountComponent {

    public user: User;
    public subscription: Subscription;
    public accountForm: FormGroup;
    public errorMessage: string;
    public feedbackMessage: string;

    public firstname: string;
    public lastname: string;
    public uploader: FileUploader;
    public isRefreshingPicture: boolean;

    constructor(public auth: Auth, public errorService: ErrorService, private userService: UserService, private userFactory: UserFactory,
        private cloudinary: Cloudinary) {
        this.accountForm = new FormGroup({
            "firstname": new FormControl(this.firstname, [
                Validators.required
            ]),
            "lastname": new FormControl(this.firstname, [
                Validators.required
            ])
        });
    }

    ngOnInit() {
        this.subscription = this.auth.getUser().subscribe((user: User) => {
            this.user = user;
            this.firstname = user.firstname;
            this.lastname = user.lastname;
        },
            (error: any) => { this.errorService.handleError(error) });

        const uploaderOptions: FileUploaderOptions = {
            url: `https://api.cloudinary.com/v1_1/${this.cloudinary.config().cloud_name}/upload`,
            // Upload files automatically upon addition to upload queue
            autoUpload: true,
            // Use xhrTransport in favor of iframeTransport
            isHTML5: true,

            maxFileSize: 1024000 *2,
            // Calculate progress independently for each uploaded file
            removeAfterUpload: true,
            // XHR request headers
            headers: [
                {
                    name: "X-Requested-With",
                    value: "XMLHttpRequest"
                }
            ]
        };

        this.uploader = new FileUploader(uploaderOptions);
        this.uploader.onBuildItemForm = (fileItem: any, form: FormData): any => {
            this.isRefreshingPicture = true;
            this.errorMessage = "";
            // Add Cloudinary's unsigned upload preset to the upload form
            form.append("upload_preset", this.cloudinary.config().upload_preset);
            // Add built-in and custom tags for displaying the uploaded photo in the list
            form.append("context", `user_id=${encodeURIComponent(this.user.user_id)}`);
            form.append("tags", environment.CLOUDINARY_PROFILE_TAGNAME);
            form.append("file", fileItem);

            // Use default "withCredentials" value for CORS requests
            fileItem.withCredentials = false;
            return { fileItem, form };
        };

        this.uploader.onWhenAddingFileFailed = (item: FileLikeObject, filter: any, options: any) => {

            if (filter.name === "fileSize") {
                this.errorMessage = "The image size must not exceed 2mb."
            }
        }

        this.uploader.onCompleteItem = (item: any, response: string, status: number, headers: ParsedResponseHeaders) => {
            let pictureURL = JSON.parse(response).secure_url;
            this.updatePicture(pictureURL);
        }

        this.uploader.onProgressItem = (fileItem: any, progress: any) => {
            this.isRefreshingPicture = true
        }
    }

    ngOnDestroy() {
        if(this.subscription)
        this.subscription.unsubscribe();
    }

    save() {
        if (this.accountForm.dirty && this.accountForm.valid) {
            let firstname = this.accountForm.controls["firstname"].value;
            let lastname = this.accountForm.controls["lastname"].value;

            this.userService.updateUserProfile(this.user.user_id, firstname, lastname)
                .then((hasUpdated: boolean) => {
                    if (hasUpdated) {
                        this.auth.getUser();
                        this.feedbackMessage = "Successfully updated."
                    }
                    else
                        return Promise.reject("Can't update your user information.")
                }, (reason) => { return Promise.reject(reason) })
                .then(() => {
                    this.user.firstname = firstname;
                    this.user.lastname = lastname;
                    return this.userFactory.upsert(this.user).then(hasUpdated => {
                        if (!hasUpdated)
                            return Promise.reject("Cannot sync your user information")
                    },
                        () => { return Promise.reject("Cannot sync your user information") });
                })
                .catch((reason) => {
                    this.errorMessage = reason
                })

        }
    }

    updatePicture(pictureURL: string) {
        this.userService.updateUserPictureUrl(this.user.user_id, pictureURL)
            .then((hasUpdated: boolean) => {
                if (hasUpdated) {
                    this.auth.getUser();
                    return
                }
                else
                    return Promise.reject("Cannot update your profile picture.")
            }, (reason) => { return Promise.reject("Cannot update your profile picture.") })
            .then(() => {
                this.user.picture = pictureURL;
                return this.userFactory.upsert(this.user).then(hasUpdated => {
                    if (!hasUpdated)
                        return Promise.reject("Cannot sync your profile picture")
                },
                    () => { return Promise.reject("Cannot sync your profile picture") });
            })
            .then(() => { this.isRefreshingPicture = false })
            .catch((reason) => {
                this.errorMessage = reason
            })
    }



}