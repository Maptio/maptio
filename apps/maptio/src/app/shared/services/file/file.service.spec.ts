import { TestBed, inject } from '@angular/core/testing';
import { FileService, Constants } from './file.service';
import * as fs from 'fs';

describe('export.service.ts', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FileService],
    });
  });

  describe('isCsvFile', () => {
    it('should return true when file is .csv', inject(
      [FileService],
      (target: FileService) => {
        let actual = target.isCSVFile(<File>{ name: 'csv.csv' });
        expect(actual).toBeTruthy();
      }
    ));

    it('should return true when file is .csv', inject(
      [FileService],
      (target: FileService) => {
        let actual = target.isCSVFile(<File>{ name: 'notcsv.cvs' });
        expect(actual).toBeFalsy();
      }
    ));
  });

  describe('getHeaderArray', () => {
    it('should return header for well-formed .csv', inject(
      [FileService],
      (target: FileService) => {
        let csvRecordsArray = [
          'First name,Lastname, email',
          'one,Maptio, one@maptio.com',
        ];
        let actual = target.getHeaderArray(
          csvRecordsArray,
          Constants.tokenDelimeter
        );
        expect(actual).toEqual(['First name', 'Lastname', ' email']);
      }
    ));

    it('should return [] for empty .csv', inject(
      [FileService],
      (target: FileService) => {
        let csvRecordsArray: string[] = [];
        let actual = target.getHeaderArray(
          csvRecordsArray,
          Constants.tokenDelimeter
        );
        expect(actual).toEqual([]);
      }
    ));
  });

  describe('validateHeaders', () => {
    it('should return true when header is matching', inject(
      [FileService],
      (target: FileService) => {
        let fileHeader = ['First name', 'Lastname', ' email'];
        let correctHeader = ['First name', 'Lastname', ' email'];

        let actual = target.validateHeaders(fileHeader, correctHeader);
        expect(actual).toBeTruthy();
      }
    ));

    it('should return false when header is in wrong order', inject(
      [FileService],
      (target: FileService) => {
        let fileHeader = ['First name', 'Lastname', ' email'];
        let correctHeader = [' email', 'First name', 'Lastname'];

        let actual = target.validateHeaders(fileHeader, correctHeader);
        expect(actual).toBeFalsy();
      }
    ));

    it('should return false when header is of wrong length', inject(
      [FileService],
      (target: FileService) => {
        let fileHeader = ['First name', 'Lastname', ' email'];
        let correctHeader = ['First name', 'Lastname'];

        let actual = target.validateHeaders(fileHeader, correctHeader);
        expect(actual).toBeFalsy();
      }
    ));
  });

  describe('getDataRecordsArrayFromCSVFile', () => {
    it('should return correct array for well-formed csv ', inject(
      [FileService],
      (target: FileService) => {
        let csvRecordsArray = [
          'First name,Lastname,email',
          'one,Maptio,one@maptio.com',
          'two,Maptio,two@maptio.com',
        ];
        let actual = target.getDataRecordsArrayFromCSVFile(
          csvRecordsArray,
          3,
          true,
          Constants.tokenDelimeter
        );

        expect(actual[0]).toEqual(['First name', 'Lastname', 'email']);
        expect(actual[1]).toEqual(['one', 'Maptio', 'one@maptio.com']);
        expect(actual[2]).toEqual(['two', 'Maptio', 'two@maptio.com']);
      }
    ));

    xit('should throw when header length is incorrect and check validateHeaderAndRecordLengthFlag= true ', inject(
      [FileService],
      (target: FileService) => {
        let csvRecordsArray = [
          'First name,Lastname,email',
          'one,Maptio,one@maptio.com',
          'two,Maptio,two@maptio.com',
        ];
        expect(function () {
          target.getDataRecordsArrayFromCSVFile(
            csvRecordsArray,
            2,
            true,
            Constants.tokenDelimeter
          );
        }).toThrow(
          'Record at line number 0 contain 3 tokens, and is not matching with header length of :2'
        );
      }
    ));
  });
});
