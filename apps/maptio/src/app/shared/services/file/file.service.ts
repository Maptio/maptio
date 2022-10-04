import { Injectable } from '@angular/core';

@Injectable()
export class Constants {
  static tokenDelimeter = ',';
  static isHeaderPresentFlag = true;
  static validateHeaderAndRecordLengthFlag = true;
  static valildateFileExtenstionFlag = true;
}

@Injectable()
export class FileService {
  constructor() {}

  isCSVFile(file: File) {
    return file.name.endsWith('.csv');
  }

  isEmptyString(val: any) {
    return val === undefined || val === '';
  }

  getHeaderArray(csvRecordsArr: any[], tokenDelimeter: string) {
    const headers = (csvRecordsArr[0] || '').split(tokenDelimeter);
    const headerArray = [];
    for (let j = 0; j < headers.length; j++) {
      if (!this.isEmptyString(headers[j])) headerArray.push(headers[j]);
    }
    return headerArray;
  }

  validateHeaders(origHeaders: any[], fileHeaders: any[]) {
    if (origHeaders.length !== fileHeaders.length) {
      return false;
    }

    let fileHeaderMatchFlag = true;
    for (let j = 0; j < origHeaders.length; j++) {
      if (origHeaders[j].toLowerCase() !== fileHeaders[j].toLowerCase()) {
        fileHeaderMatchFlag = false;
        break;
      }
    }
    return fileHeaderMatchFlag;
  }

  getDataRecordsArrayFromCSVFile(
    csvRecordsArray: any[],
    headerLength: number,
    validateHeaderAndRecordLengthFlag: boolean,
    tokenDelimeter: string
  ) {
    const dataArr = [];

    for (let i = 0; i < csvRecordsArray.length; i++) {
      const data = csvRecordsArray[i]
        .split(tokenDelimeter)
        .slice(0, headerLength);
      if (data.join('') === '') continue; // ignore empty lines
      if (validateHeaderAndRecordLengthFlag && data.length !== headerLength) {
        if (data === '') {
          throw $localize`
            Extra blank line is present at line number ${i}, please remove it.
          `;
        } else {
          throw $localize`
            Record at line number ${i} contains ${data.length} tokens, and is not matching with header length of : ${headerLength}
          `;
        }
      }

      const col = [];
      for (let j = 0; j < data.length; j++) {
        col.push(data[j]);
      }
      dataArr.push(col);
    }
    return dataArr;
  }
}
