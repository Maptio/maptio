import { DataSet } from "./dataset.data";

describe("Dataset Tests", () => {
    let dataset: DataSet;

    let NAME: string = "name";

    beforeEach(() => {
    });

    it("Creates new correctly", () => {
        dataset = new DataSet({ name: NAME });

        expect(dataset.name).toBe(NAME);
    });

    it("Creates EMPTY correctly", () => {
        dataset = DataSet.EMPTY;

        expect(dataset.name).toBe("New project");
    });
});
