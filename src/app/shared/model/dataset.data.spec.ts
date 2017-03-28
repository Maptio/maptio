import { DataSet } from "./dataset.data";

describe("Dataset Tests", () => {
    let dataset: DataSet;

    let NAME: string = "name";
    let URL: string = "http://getmydataset.com/name.json";

    beforeAll(() => {
        fixture.setBase("src/app/shared/model/fixtures");
    });

    afterEach(() => {
        fixture.cleanup();
    })

    describe("deserialize", () => {
        it("should work with valid JSON data", () => {
            let json = fixture.load("dataset.json");
            console.log(json);
            let deserialized = DataSet.create().deserialize(json);
            expect(deserialized).toBeDefined();
            console.log(deserialized._id);
            //console.log(deserialized.name);
            console.log(deserialized.createdOn);
            console.log(deserialized.initiative);
        })
    })

    it("Creates new correctly", () => {
        dataset = new DataSet({ name: NAME, url: URL });

        expect(dataset.name).toBe(NAME);
        // expect(dataset.url).toBe(URL);
        // expect(dataset.content).toBe(undefined);
    });

    xit("Creates EMPTY correctly", () => {
        dataset = DataSet.EMPTY;

        expect(dataset.name).toBe("New project");
        // expect(dataset.url).toBe("../../../assets/datasets/new.json");
        // expect(dataset.content).toBe(undefined);
    });
});
