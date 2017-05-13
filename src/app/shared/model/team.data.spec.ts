import { Team } from "./team.data";
import { User } from "./user.data";

describe("Team Tests", () => {
    let team: Team;

    beforeEach(() => {
    });

    it("should create a new team with empty properties", () => {
        team = new Team();
        expect(team.members).toBeUndefined()
        expect(team.name).toBeUndefined();
    });

    it("should create a new team with values", () => {
        let person1 = new User();
        person1.name = "member 1";
        let person2 = new User();
        person2.name = "member 2"
        let person3 = new User();
        person3.name = "member 3"

        team = new Team({ members: [person1, person2, person3], name: "Team" });

        expect(team.members.length).toBe(3);
        expect(team.name).toBe("Team")
    });
});
