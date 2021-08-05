import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { BehaviorSubject, of } from 'rxjs';
import { catchError } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class EmbeddableDatasetService {
  public dataset = new BehaviorSubject<any | null | undefined>(undefined); // eslint-disable-line @typescript-eslint/no-explicit-any

  constructor(private http: HttpClient) {}

  getDataset(datasetId: string | null) {
    if (datasetId) {
      this.http.get('/api/v1/embeddable-dataset/' + datasetId)
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
      this.dataset.next(null);
    }

    return this.dataset;
  }
}
