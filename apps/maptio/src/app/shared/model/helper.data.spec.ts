import { Helper } from './helper.data';

describe('helper.data.ts', () => {
  beforeEach(() => {});

  describe('Serialization', () => {
    describe('deserialize', () => {
      it('should deserialize a valid input , no roles', () => {
        const input = JSON.parse(
          '{"name": "John Doe", "email":"jdoe@domain.com", "picture":"http://address.com", "user_id":"unique" }'
        );
        const deserialized = new Helper().deserialize(input);
        expect(deserialized).toBeDefined();
        expect(deserialized.name).toBe('John Doe');
        expect(deserialized.email).toBe('jdoe@domain.com');
        expect(deserialized.picture).toBe('http://address.com');
        expect(deserialized.user_id).toBe('unique');
        expect(deserialized.roles).toEqual([]);
      });

      it('should deserialize a valid input , with roles', () => {
        const input = JSON.parse(
          `{"name": "John Doe", "email":"jdoe@domain.com", "picture":"http://address.com", "user_id":"unique", "roles":[{"description":"Some role"}] }`
        );
        const deserialized = new Helper().deserialize(input);
        expect(deserialized).toBeDefined();
        expect(deserialized.name).toBe('John Doe');
        expect(deserialized.email).toBe('jdoe@domain.com');
        expect(deserialized.picture).toBe('http://address.com');
        expect(deserialized.user_id).toBe('unique');
        expect(deserialized.roles.length).toBe(1);
      });

      it('should return undefined when deserializing an invalid input', () => {
        const input = JSON.parse('{"notaname": "John Doe"}');
        const deserialized = new Helper().deserialize(input);
        expect(deserialized).toBeUndefined();
      });
    });

    describe('tryDeserialize', () => {
      it('should return true when input is valid', () => {
        const input = JSON.parse(
          '{"name": "John Doe", "email":"jdoe@domain.com", "picture":"http://address.com", "user_id" :"unique"}'
        );
        const deserialized = new Helper().tryDeserialize(input);
        expect(deserialized).toBeDefined();
        expect(deserialized[0]).toBe(true);
        expect(deserialized[1]).toBeDefined();
        expect(deserialized[1].name).toBe('John Doe');
        expect(deserialized[1].email).toBe('jdoe@domain.com');
        expect(deserialized[1].picture).toBe('http://address.com');
        expect(deserialized[1].user_id).toBe('unique');
      });

      it('should return false when input is invalid', () => {
        const input = JSON.parse('{"name": "John Doe"}');
        const deserialized = new Helper().tryDeserialize(input);
        expect(deserialized).toBeDefined();
        expect(deserialized[0]).toBe(false);
        expect(deserialized[1]).toBeUndefined();
      });

      it('should return false when parsing fails', () => {
        const user = new Helper();
        const input = JSON.parse('{}');
        spyOn(user, 'deserialize').and.throwError('Cannot be parsed');
        const deserialized = user.tryDeserialize(input);
        expect(deserialized).toBeDefined();
        expect(deserialized[0]).toBe(false);
        expect(deserialized[1]).toBeUndefined();
      });
    });
  });
});
