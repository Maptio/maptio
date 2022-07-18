import { filter } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Observable, ReplaySubject, Subject } from 'rxjs';
import { ErrorService } from '../../../shared/services/error/error.service';
import { Tag, SelectableTag } from '../../../shared/model/tag.data';

@Injectable()
export class DataService {
  private _data$: ReplaySubject<any>;

  constructor() {
    this._data$ = new ReplaySubject();
  }

  set(data: any): void {
    this._data$.next(data);
  }

  get(): Observable<any> {
    return this._data$.asObservable();
  }

  // fetch(url: string): Promise<any> {
  //     return this.http.get(url)
  //         .toPromise()
  //         .then(response => response.json())
  //         .catch(this.errorService.handleError);
  // }
}

export class CounterService {
  private _counter$: ReplaySubject<{ datasetId: string; time: any }>;

  // private updateMap: Map<String, number>;
  constructor() {
    this._counter$ = new ReplaySubject();
    // this.updateMap = new Map<String, number>();
  }

  set(data: { datasetId: string; time: any }): void {
    this._counter$.next(data);
  }

  get(datasetId: string): Observable<{ datasetId: string; time: any }> {
    return this._counter$
      .asObservable()
      .pipe(filter((c) => c.datasetId === datasetId));
  }
}
