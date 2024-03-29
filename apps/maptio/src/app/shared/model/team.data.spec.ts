import { Team } from './team.data';
import { User } from './user.data';
import { environment } from '../../config/environment';

describe('Team Tests', () => {
  let team: Team;

  beforeEach(() => {});

  it('should create a new team with empty properties', () => {
    team = new Team();
    expect(team.members).toBeUndefined();
    expect(team.name).toBeUndefined();
  });

  it('should create a new team with values', () => {
    const person1 = new User();
    person1.name = 'member 1';
    const person2 = new User();
    person2.name = 'member 2';
    const person3 = new User();
    person3.name = 'member 3';

    team = new Team({ members: [person1, person2, person3], name: 'Team' });

    expect(team.members.length).toBe(3);
    expect(team.name).toBe('Team');
  });

  describe('Serialization', () => {
    describe('deserialize', () => {
      it('should deserialize a valid input - no settings', () => {
        const input = JSON.parse(
          '{"name": "Team FTW", "_id":"unique" , "members":[{"name":"John", "user_id":"1"}, {"name":"Jane"}]}'
        );
        const deserialized = new Team().deserialize(input);
        expect(deserialized).toBeDefined();
        expect(deserialized.name).toBe('Team FTW');
        expect(deserialized.team_id).toBe('unique');
        expect(deserialized.settings.authority).toBe(
          environment.DEFAULT_AUTHORITY_TERMINOLOGY
        );
        expect(deserialized.settings.helper).toBe(
          environment.DEFAULT_HELPER_TERMINOLOGY
        );
        expect(deserialized.members).toBeDefined();
        expect(deserialized.members.length).toBe(2);
        expect(deserialized.members[0].name).toBe('John');
        expect(deserialized.members[1]).toBeUndefined();
      });

      it('should deserialize a valid input - with settings', () => {
        const input = JSON.parse(
          '{"name": "Team FTW", "settings" : {"authority" : "Driver", "helper": "Backseat"}, "_id":"unique" , "members":[{"name":"John", "user_id":"1"}, {"name":"Jane"}]}'
        );
        const deserialized = new Team().deserialize(input);
        expect(deserialized).toBeDefined();
        expect(deserialized.name).toBe('Team FTW');
        expect(deserialized.team_id).toBe('unique');
        expect(deserialized.settings.authority).toBe('Driver');
        expect(deserialized.settings.helper).toBe('Backseat');
        expect(deserialized.members).toBeDefined();
        expect(deserialized.members.length).toBe(2);
        expect(deserialized.members[0].name).toBe('John');
        expect(deserialized.members[1]).toBeUndefined();
      });

      it('should return undefined when deserializing an invalid input', () => {
        const input = JSON.parse('{"notanid": "Team Loosers"}');
        const deserialized = new Team().deserialize(input);
        expect(deserialized).toBeUndefined();
      });
    });

    describe('tryDeserialize', () => {
      it('should return true when input is valid', () => {
        const input = JSON.parse(
          '{"name": "Team FTW", "_id":"unique" , "members":[{"name":"John", "user_id":"1"}, {"name":"Jane"}]}'
        );
        const deserialized = new Team().tryDeserialize(input);
        expect(deserialized).toBeDefined();
        expect(deserialized[0]).toBe(true);
        expect(deserialized[1]).toBeDefined();
        expect(deserialized[1].name).toBe('Team FTW');
      });

      it('should return false when input is invalid', () => {
        const input = JSON.parse('{"notanid": "Team Loosers"}');
        const deserialized = new Team().tryDeserialize(input);
        expect(deserialized).toBeDefined();
        expect(deserialized[0]).toBe(false);
        expect(deserialized[1]).toBeUndefined();
      });

      it('should return false when parsing fails', () => {
        const team = new Team();
        const input = JSON.parse('{}');
        spyOn(team, 'deserialize').and.throwError('Cannot be parsed');
        const deserialized = team.tryDeserialize(input);
        expect(deserialized).toBeDefined();
        expect(deserialized[0]).toBe(false);
        expect(deserialized[1]).toBeUndefined();
      });
    });
  });
});
