import { Angulartics2Mixpanel } from "angulartics2";
import { TeamFactory } from "./../../../../shared/services/team.factory";
import { UserFactory } from "./../../../../shared/services/user.factory";
import { DataSet } from "./../../../../shared/model/dataset.data";
import { DatasetFactory } from "./../../../../shared/services/dataset.factory";
import { User } from "./../../../../shared/model/user.data";
import { UserService } from "./../../../../shared/services/user/user.service";
import { Team } from "./../../../../shared/model/team.data";
import { Component, OnInit, Input, ViewChild, ChangeDetectorRef } from "@angular/core";
import { FileUploader, FileUploaderOptions, FileLikeObject, ParsedResponseHeaders } from "ng2-file-upload";
import { Constants, FileService } from "../../../../shared/services/file/file.service";
import * as _ from "lodash";

@Component({
    selector: "team-single-import",
    templateUrl: "./import.component.html",
    styleUrls: ["./import.component.css"]
})
export class TeamImportComponent implements OnInit {

    @Input() team: Team;
    @ViewChild("fileImportInput") fileImportInput: any;

    csvRecords: any[] = [];
    currentImportedUserIndex: number;
    importUserLength: number;
    progress: number;
    importedSuccessfully: number;
    importedFailed: number;
    totalRecordsToImport: number;
    isImportFinished: boolean;
    isParsingFinished: boolean;
    isFileInvalid: boolean;

    constructor(
        private fileService: FileService,
        private cd: ChangeDetectorRef,
        private userService: UserService,
        private datasetFactory: DatasetFactory,
        private userFactory: UserFactory,
        private teamFactory: TeamFactory,
        private analytics: Angulartics2Mixpanel) { }

    ngOnInit() { }

    fileChangeListener($event: any): void {
        this.isParsingFinished = false;
        this.isFileInvalid = false;
        this.importedSuccessfully = 0;
        this.importedFailed = 0;
        this.csvRecords = [];
        let text = [];
        let files = $event.srcElement.files;

        if (Constants.validateHeaderAndRecordLengthFlag) {
            if (!this.fileService.isCSVFile(files[0])) {
                this.isFileInvalid = true;
                this.fileReset();
            }
        }

        let input = $event.target;
        let reader = new FileReader();
        reader.readAsText(input.files[0], "utf-8");

        reader.onload = (data) => {
            let csvData = reader.result;
            let csvRecordsArray = csvData.split(/\r\n|\n|\r/);
            let headerLength = -1;
            if (Constants.isHeaderPresentFlag) {
                let headersRow = this.fileService.getHeaderArray(csvRecordsArray, Constants.tokenDelimeter);
                headerLength = headersRow.length;
                let isHeaderValid = this.fileService.validateHeaders(headersRow, ["First name", "Last name", "Email"]);
                if (!isHeaderValid) {
                    this.isFileInvalid = true;
                }
            }

            try {
                this.csvRecords = this.fileService.getDataRecordsArrayFromCSVFile(csvRecordsArray,
                    headerLength, Constants.validateHeaderAndRecordLengthFlag, Constants.tokenDelimeter);
                this.totalRecordsToImport = this.csvRecords.length - 1; // remove header
                if (this.csvRecords == null) {
                    // If control reached here it means csv file contains error, reset file.
                    this.fileReset();
                }

            }
            catch (error) {

                // console.log(error)
                this.isFileInvalid = true;
            }
            finally {
                this.cd.markForCheck();
            }
            this.isParsingFinished = true;
        }

        reader.onerror = function () {
            // alert("Unable to read " + input.files[0]);
            this.isFileInvalid = true;
        }.bind(this);
    };

    fileReset() {
        this.isFileInvalid = false;
        this.importedSuccessfully = 0;
        this.importedFailed = 0;
        this.isImportFinished = false;
        this.fileImportInput.nativeElement.value = "";
        this.csvRecords = [];
    }

    importUsers() {
        this.isImportFinished = false;
        this.importedSuccessfully = 0;
        this.importedFailed = 0;

        _(this.csvRecords).drop(1).forEach((record, index, all) => {
            record[3] = "";
            record[4] = false; // has finished processed
            this.createUser((<String>record[2]).trim(), (<String>record[0]).trim(), (<String>record[1]).trim())
                .then(result => {
                    this.importedSuccessfully += 1;
                    record[3] = "Imported";
                    record[4] = true;
                    this.cd.markForCheck();
                }, (error: any) => {
                    this.importedFailed += 1;
                    record[3] = error.message;
                    record[4] = true;
                    this.cd.markForCheck();
                });
        });
        this.isImportFinished = true;
    }

    private createUser(email: string, firstname: string, lastname: string) {

        return this.userService.createUser(email, firstname, lastname)
            .then((user: User) => {
                return this.datasetFactory.get(this.team).then((datasets: DataSet[]) => {
                    let virtualUser = new User();
                    virtualUser.name = user.name;
                    virtualUser.email = user.email;
                    virtualUser.firstname = user.firstname;
                    virtualUser.lastname = user.lastname;
                    virtualUser.nickname = user.nickname;
                    virtualUser.user_id = user.user_id;
                    virtualUser.picture = user.picture;
                    virtualUser.teams = [this.team.team_id];
                    virtualUser.datasets = datasets.map(d => d.datasetId);

                    return virtualUser;
                }, (reason) => {
                    return Promise.reject(`Can't create ${email} : ${reason}`);
                })
            }, (reason: any) => {
                throw JSON.parse(reason._body).message;
            })
            .then((virtualUser: User) => {
                this.userFactory.create(virtualUser)
                return virtualUser;
            })
            .then((user: User) => {
                this.team.members.push(user);
                return this.teamFactory.upsert(this.team)
            })
            .then(() => {
                this.analytics.eventTrack("Team", { action: "create", team: this.team.name, teamId: this.team.team_id });
                return true;
            })
            .catch((reason) => {
                console.log(reason)
                throw Error(reason);
            })

    }
}