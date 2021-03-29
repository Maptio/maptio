import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import data from './markhof.data.json';


@Injectable({
  providedIn: 'root'
})
export class DatasetService {
  public dataset = new BehaviorSubject<any | undefined>(undefined); // eslint-disable-line @typescript-eslint/no-explicit-any

  getDataset(datasetId: string | null) {
    if (datasetId) {
      // Dummy data for now
      this.dataset.next(data);
    } else {
      // Send demo data if no dataset id is passed
      this.dataset.next(data);
    }

    return this.dataset;
  }
}
