import { Injectable } from "@angular/core";

@Injectable()
export class Constants {
    static tokenDelimeter = ",";
    static isHeaderPresentFlag = true;
    static validateHeaderAndRecordLengthFlag = true;
    static valildateFileExtenstionFlag = true;
}


@Injectable()
export class FileService {

    constructor() { }

    isCSVFile(file: File) {
        return file.name.endsWith(".csv");
    }

    getHeaderArray(csvRecordsArr: any[], tokenDelimeter: string) {
        let headers = csvRecordsArr[0].split(tokenDelimeter);
        let headerArray = [];
        for (let j = 0; j < headers.length; j++) {
            headerArray.push(headers[j]);
        }
        return headerArray;
    }

    validateHeaders(origHeaders: any[], fileHeaaders: any[]) {
        if (origHeaders.length !== fileHeaaders.length) {
            return false;
        }

        let fileHeaderMatchFlag = true;
        for (let j = 0; j < origHeaders.length; j++) {
            if (origHeaders[j] !== fileHeaaders[j]) {
                fileHeaderMatchFlag = false;
                break;
            }
        }
        return fileHeaderMatchFlag;
    }

    getDataRecordsArrayFromCSVFile(csvRecordsArray: any[], headerLength: number,
        validateHeaderAndRecordLengthFlag: boolean, tokenDelimeter: string) {
        let dataArr = []

        for (let i = 0; i < csvRecordsArray.length; i++) {
            let data = csvRecordsArray[i].split(tokenDelimeter);

            if (validateHeaderAndRecordLengthFlag && data.length !== headerLength) {
                if (data === "") {
                    alert("Extra blank line is present at line number " + i + ", please remove it.");
                    return null;
                } else {
                    alert("Record at line number " + i + " contain " + data.length + " tokens, and is not matching with header length of :" + headerLength);
                    return null;
                }
            }

            let col = [];
            for (let j = 0; j < data.length; j++) {
                col.push(data[j]);
            }
            dataArr.push(col);
        }
        return dataArr;
    }

}