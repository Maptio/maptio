import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { mergeMap, map } from 'rxjs/operators';

import * as shortid from 'shortid';

import { DataSet } from '@maptio-shared/model/dataset.data';
import { Initiative } from '@maptio-shared/model/initiative.data';
import { User } from '@maptio-shared/model/user.data';
import { Team } from '@maptio-shared/model/team.data';

@Injectable()
export class DatasetFactory {
  constructor(private http: HttpClient) {}

  upsert(dataset: DataSet, datasetId?: string): Promise<boolean> {
    return this.http
      .put('/api/v1/dataset/' + (dataset.datasetId || datasetId), dataset)
      .toPromise()
      .then(() => {
        return true;
      });
  }

  /**
   * @param dataset
   * @param user
   */
  add(dataset: DataSet, user: User): Promise<boolean> {
    return this.http
      .put(
        '/api/v1/user/' + user.user_id + '/dataset/' + dataset.datasetId,
        null
      )
      .toPromise()
      .then(() => {
        return true;
      });
  }

  /**
   * Creates a new dataset
   * @param dataset Dataset to create
   */
  create(dataset: DataSet): Promise<DataSet> {
    dataset.shortid = shortid.generate();
    if (!dataset) throw new Error('Parameter missing - on dataset creation');
    return this.http
      .post('/api/v1/dataset', dataset)
      .pipe(
        map((response: Response) => {
          return DataSet.create().deserialize(response);
        })
      )
      .toPromise();
  }

  createDemo(teamId: string): Observable<DataSet> {
    return this.http.get(`/api/v1/dataset/template/demo?teamId=${teamId}`).pipe(
      map((response: Response) => {
        return Initiative.create().deserialize(response);
      }),
      mergeMap((initiative: Initiative) => {
        return this.create(
          new DataSet({
            initiative: initiative,
          })
        );
      })
    );
  }

  /**
   *  Retrieves a list dataset matching given ids
   * @param id List of dataset ids
   */
  get(ids: string[], isMinimal?: boolean): Promise<DataSet[]>;

  /**
   *  Retrieves a dataset matching a given id
   * @param id Unique dataset id
   */
  get(id: string): Promise<DataSet>;

  /**
   * Retrieves a collection of datasets for a given user
   * @param user User
   */
  get(user: User): Promise<string[]>;

  /**
   * Retrieves one or many datasets
   * @param idOrUser Dataset unique ID or User
   */
  get(team: Team): Promise<DataSet[]>;

  /**
   * Retrieves one or many datasets
   * @param idOrUser Dataset unique ID or User
   */
  get(
    idOrUserOrTeam: string | string[] | User | Team,
    isMinimal?: boolean
  ): Promise<DataSet> | Promise<DataSet[]> | Promise<string[]> {
    if (!idOrUserOrTeam)
      return Promise.reject(
        'Parameter missing - on dataset retrieval'
      ) as Promise<DataSet>;
    if (idOrUserOrTeam instanceof User) {
      return this.getWithUser(<User>idOrUserOrTeam);
    }
    if (idOrUserOrTeam instanceof Team) {
      return this.getWithTeam(<Team>idOrUserOrTeam);
    }
    if (idOrUserOrTeam.constructor === Array) {
      return this.getWithIds(<string[]>idOrUserOrTeam, isMinimal);
    }
    return this.getWithId(<string>idOrUserOrTeam);
  }

  private getWithUser(user: User): Promise<string[]> {
    return this.http
      .get('/api/v1/user/' + user.user_id + '/datasets')
      .pipe(
        map((responseData: Array<{ _id: string }>) => {
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return responseData.map((d: any) => d._id);
          } catch (err) {
            return [];
          }
        }),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        map((result: any) => {
          return result;
        })
      )
      .toPromise();
  }

  private getWithTeam(team: Team): Promise<DataSet[]> {
    return this.http
      .get('/api/v1/team/' + team.team_id + '/datasets')
      .pipe(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        map((inputs: Array<any>) => {
          const result: Array<DataSet> = [];
          if (inputs) {
            inputs.forEach((input) => {
              result.push(DataSet.create().deserialize(input));
            });
          }
          return result;
        })
      )
      .toPromise();
  }

  private getWithId(id: string): Promise<DataSet> {
    return this.http
      .get('/api/v1/dataset/' + id)
      .pipe(
        map((response: Response) => {
          const d = DataSet.create().deserialize(response);
          d.datasetId = id; // reassign id
          return d;
        })
      )
      .toPromise();
  }

  private getWithIds(
    datasetIds: string[],
    isMinimal: boolean
  ): Promise<DataSet[]> {
    if (!datasetIds || datasetIds.length === 0) {
      return Promise.reject('You cannot make a search for all datasets !');
    }
    return this.http
      .get(
        `/api/v1/dataset/in/${datasetIds.join(',')}${
          isMinimal ? '/minimal' : ''
        }`
      )
      .pipe(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        map((inputs: Array<any>) => {
          const result: Array<DataSet> = [];
          if (inputs) {
            inputs.forEach((input) => {
              result.push(DataSet.create().deserialize(input));
            });
          }
          return result;
        })
      )
      .toPromise();
  }
}
