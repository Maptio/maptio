import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { BehaviorSubject, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { environment } from './../environments/environment';


import data from './markhof.data.json';


@Injectable({
  providedIn: 'root'
})
export class DatasetService {
  public dataset = new BehaviorSubject<any | null | undefined>(undefined); // eslint-disable-line @typescript-eslint/no-explicit-any

  constructor(private http: HttpClient) {}

  getDataset(datasetId: string | null) {
    if (datasetId) {
      this.http.get(environment.maptioApiUrl + 'embeddable-dataset/' + datasetId)
        .pipe(
          catchError((error: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
            console.error(error);
            return of(null);
          })
        )
        .subscribe((dataset: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
          if (dataset) {
            this.dataset.next(dataset.initiative);
          } else {
            this.dataset.next(null);
          }
        });
    } else {
      // Send demo data if no dataset id is passed
      this.dataset.next(data);
    }

    return this.dataset;
  }
}
