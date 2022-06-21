import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { environment } from '@maptio-config/environment';

import { drop } from 'lodash-es';
import { UserService } from '@maptio-shared/services/user/user.service';
import { Team } from '@maptio-shared/model/team.data';
import { DataSet } from '@maptio-shared/model/dataset.data';
import {
  Constants,
  FileService,
} from '@maptio-shared/services/file/file.service';

@Component({
  selector: 'maptio-team-import',
  templateUrl: './import.component.html',
  styleUrls: ['./import.component.css'],
})
export class TeamImportComponent implements OnInit {
  team: Team;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @ViewChild('fileImportInput', { static: true }) fileImportInput: any;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.parent.data.subscribe(
      (data: { assets: { team: Team; datasets: DataSet[] } }) => {
        this.team = data.assets.team;
      }
    );
  }

  /*
   * These functions do the main work of creating users;
   */

  public createUser(email: string, firstname: string, lastname: string) {
    // Code useful for testing error handling
    // if (Math.random() > 0.6) {
    //   return Promise.resolve(true);
    // } else {
    //   return Promise.reject(new Error('Something really bad happened!'));
    // }

    // Deal with duplication here? Separately for emails and names?

    return this.userService.createUserAndAddToTeam(
      this.team,
      email,
      firstname,
      lastname,
      '',
      false,
    );
  }

  /*
   * These functions process user interactions, including reading CSV data and
   * trigger import of each user separately
   */

  onImportUsers() {
    this.isImportFinished = false;
    this.importedSuccessfully = 0;
    this.importedFailed = 0;

    drop(this.csvRecords, 1).forEach((record) => {
      record[4] = '';
      record[5] = false; // has finished processed

      this.createUser(
        (<string>record[2]).trim(),
        (<string>record[0]).trim(),
        (<string>record[1]).trim()
      ).then(
        () => {
          this.importedSuccessfully += 1;
          record[4] = 'Imported';
          record[5] = true;
          this.cd.markForCheck();
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onFileChange($event: any): void {
    this.isParsingFinished = false;
    this.isFileInvalid = false;
    this.isFileFormatInvalid = false;
    this.importedSuccessfully = 0;
    this.importedFailed = 0;
    this.csvRecords = [];
    const files = $event.srcElement.files;

    if (!this.fileService.isCSVFile(files[0])) {
      this.isFileFormatInvalid = true;
      this.onReset();
    }

    const input = $event.target as HTMLInputElement;

    const reader = new FileReader();
    reader.readAsText(input.files[0], 'utf-8');

    reader.onload = () => {
      const csvData = reader.result as string;
      const csvRecordsArray = csvData
        .split(/\r\n|\n|\r/)
        .filter((s: string) => s !== '');
      let headerLength = -1;
      const headersRow = this.fileService.getHeaderArray(
        csvRecordsArray,
        Constants.tokenDelimeter
      );
      headerLength = headersRow.length;
      const isHeaderValid = this.fileService.validateHeaders(headersRow, [
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
          this.onReset();
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

  onReset() {
    this.isFileInvalid = false;
    this.isFileFormatInvalid = false;
    this.importedSuccessfully = 0;
    this.importedFailed = 0;
    this.isImportFinished = false;
    this.fileImportInput.nativeElement.value = '';
    this.csvRecords = [];
    this.isParsingFinished = false;
  }
}
