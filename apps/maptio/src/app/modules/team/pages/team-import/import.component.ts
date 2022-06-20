import { UserRole } from '../../../../shared/model/permission.data';
import { environment } from '../../../../config/environment';
import { ActivatedRoute } from '@angular/router';
import { Angulartics2Mixpanel } from 'angulartics2/mixpanel';
import { TeamFactory } from '../../../../core/http/team/team.factory';
import { UserFactory } from '../../../../core/http/user/user.factory';
import { DataSet } from '../../../../shared/model/dataset.data';
import { DatasetFactory } from '../../../../core/http/map/dataset.factory';
import { User } from '../../../../shared/model/user.data';
import { UserService } from '../../../../shared/services/user/user.service';
import { Team } from '../../../../shared/model/team.data';
import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import {
  Constants,
  FileService,
} from '../../../../shared/services/file/file.service';
import { drop } from 'lodash-es';

@Component({
  selector: 'maptio-team-import',
  templateUrl: './import.component.html',
  styleUrls: ['./import.component.css'],
})
export class TeamImportComponent implements OnInit {
  team: Team;
  @ViewChild('fileImportInput', { static: true }) fileImportInput: any;

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
  isFileFormatInvalid: boolean;

  KB_URL_PERMISSIONS = environment.KB_URL_PERMISSIONS;
  IMPORT_USERS_TEMPLATE_URL = environment.IMPORT_USERS_TEMPLATE_URL;
  constructor(
    private fileService: FileService,
    private cd: ChangeDetectorRef,
    private userService: UserService,
    private datasetFactory: DatasetFactory,
    private userFactory: UserFactory,
    private teamFactory: TeamFactory,
    private analytics: Angulartics2Mixpanel,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.parent.data.subscribe(
      (data: { assets: { team: Team; datasets: DataSet[] } }) => {
        this.team = data.assets.team;
      }
    );
  }

  fileChangeListener($event: any): void {
    this.isParsingFinished = false;
    this.isFileInvalid = false;
    this.isFileFormatInvalid = false;
    this.importedSuccessfully = 0;
    this.importedFailed = 0;
    this.csvRecords = [];
    let text = [];
    let files = $event.srcElement.files;

    if (!this.fileService.isCSVFile(files[0])) {
      this.isFileFormatInvalid = true;
      this.fileReset();
    }

    let input = $event.target as HTMLInputElement;

    let reader = new FileReader();
    reader.readAsText(input.files[0], 'utf-8');

    reader.onload = (data) => {
      let csvData = reader.result as string;
      let csvRecordsArray = csvData
        .split(/\r\n|\n|\r/)
        .filter((s: string) => s !== '');
      let headerLength = -1;
      let headersRow = this.fileService.getHeaderArray(
        csvRecordsArray,
        Constants.tokenDelimeter
      );
      headerLength = headersRow.length;
      let isHeaderValid = this.fileService.validateHeaders(headersRow, [
        'First name',
        'Last name',
        'Email',
      ]);
      if (!isHeaderValid) {
        this.isFileInvalid = true;
        this.cd.markForCheck();
        return;
      }

      try {
        this.csvRecords = this.fileService.getDataRecordsArrayFromCSVFile(
          csvRecordsArray,
          headerLength,
          Constants.validateHeaderAndRecordLengthFlag,
          Constants.tokenDelimeter
        );
        this.totalRecordsToImport = this.csvRecords.length - 1; // remove header
        if (this.csvRecords == null) {
          // If control reached here it means csv file contains error, reset file.
          this.fileReset();
        }
      } catch (error) {
        console.error(error);
        this.isFileInvalid = true;
      } finally {
        this.isParsingFinished = true;
        this.cd.markForCheck();
      }
    };

    reader.onerror = function () {
      // alert("Unable to read " + input.files[0]);
      this.isFileInvalid = true;
    }.bind(this);
  }

  fileReset() {
    this.isFileInvalid = false;
    this.isFileFormatInvalid = false;
    this.importedSuccessfully = 0;
    this.importedFailed = 0;
    this.isImportFinished = false;
    this.fileImportInput.nativeElement.value = '';
    this.csvRecords = [];
    this.isParsingFinished = false;
  }

  importUsers() {
    this.isImportFinished = false;
    this.importedSuccessfully = 0;
    this.importedFailed = 0;

    drop(this.csvRecords, 1).forEach((record, index, all) => {
      record[4] = '';
      record[5] = false; // has finished processed

      this.createUser(
        (<String>record[2]).trim(),
        (<String>record[0]).trim(),
        (<String>record[1]).trim()
      ).then(
        (result) => {
          this.importedSuccessfully += 1;
          record[4] = 'Imported';
          record[5] = true;
          this.cd.markForCheck();
        },
        (error: any) => {
          this.importedFailed += 1;
          record[4] = error.message;
          record[5] = true;
          this.cd.markForCheck();
        }
      );
    });
    this.isImportFinished = true;
  }

  public createFakeUser(email: string, firstname: string, lastname: string) {
    if (Math.random() > 0.6) {
      return Promise.resolve(true);
    } else {
      return Promise.reject(new Error('Something really bad happened!'));
    }
  }

  public createUser(email: string, firstname: string, lastname: string) {
    console.log('TODO');
    return Promise.resolve('TODO');

    //     return this.userService.createUserPlaceholder(email, firstname, lastname, false, false)
    //         .then((user: User) => {
    //             return this.datasetFactory.get(this.team).then((datasets: DataSet[]) => {
    //                 let virtualUser = new User();
    //                 virtualUser.name = user.name;
    //                 virtualUser.email = user.email;
    //                 virtualUser.firstname = user.firstname;
    //                 virtualUser.lastname = user.lastname;
    //                 virtualUser.nickname = user.nickname;
    //                 virtualUser.user_id = user.user_id;
    //                 virtualUser.picture = user.picture;
    //                 virtualUser.teams = [this.team.team_id];
    //                 virtualUser.datasets = datasets.map(d => d.datasetId);

    //                 return virtualUser;
    //             }, (reason) => {
    //                 return Promise.reject(`Can't create ${email} : ${reason}`);
    //             })
    //         }, (reason: any) => {
    //             throw JSON.parse(reason._body).message;
    //         })
    //         .then((virtualUser: User) => {
    //             this.userFactory.create(virtualUser)
    //             return virtualUser;
    //         })
    //         .then((user: User) => {
    //             this.team.members.push(user);
    //             return this.teamFactory.upsert(this.team)
    //         })
    //         .then(() => {
    //             this.analytics.eventTrack("Team", { action: "create", team: this.team.name, teamId: this.team.team_id });
    //             return true;
    //         })
    //         .catch((reason) => {
    //             throw Error(reason);
    //         })

    //     // }
  }
}
