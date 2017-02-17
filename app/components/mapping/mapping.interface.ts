export interface IDataVisualizer {

    width: number;

    height: number;

    margin: number;

    draw(data: any): void;
}