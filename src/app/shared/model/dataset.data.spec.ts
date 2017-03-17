import { DataSet } from "./dataset.data";

describe("Dataset Tests", () => {
    let dataset: DataSet;

    let NAME: string = "name";
    let URL: string = "http://getmydataset.com/name.json";

    beforeEach(() => {
    });

    it("Creates new correctly", () => {
        dataset = new DataSet({ name: NAME, url: URL });

        expect(dataset.name).toBe(NAME);
        expect(dataset.url).toBe(URL);
        expect(dataset.content).toBe(undefined);
    });

    it("Creates EMPTY correctly", () => {
        dataset = DataSet.EMPTY;

        expect(dataset.name).toBe("New project");
        expect(dataset.url).toBe("../../../assets/datasets/new.json");
        expect(dataset.content).toBe(undefined);
    });
});
