import { Observable } from "rxjs/Rx";

export interface IDataVisualizer {

    datasetId:string;

    width: number;

    height: number;

    margin: number;

    zoom$: Observable<number>;

    fontSize$: Observable<number>;

    draw(data: any): void;
}