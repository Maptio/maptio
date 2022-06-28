import { Role } from './role.data';

describe('role.data.ts', () => {
  beforeEach(() => {});

  describe('Serialization', () => {
    describe('deserialize', () => {
      it('should deserialize a valid input', () => {
        const input = JSON.parse('{"description": "Some role"}');
        const deserialized = new Role().deserialize(input);
        expect(deserialized).toBeDefined();
        expect(deserialized.description).toBe('Some role');
      });

      it('should return undefined when deserializing an invalid input', () => {
        const input = JSON.parse('{"notadescription": "Ahah"}');
        const deserialized = new Role().deserialize(input);
        expect(deserialized).toBeUndefined();
      });
    });

    describe('tryDeserialize', () => {
      it('should return true when input is valid', () => {
        const input = JSON.parse('{"description": "Some role"}');
        const deserialized = new Role().tryDeserialize(input);
        expect(deserialized).toBeDefined();
        expect(deserialized[0]).toBe(true);
        expect(deserialized[1]).toBeDefined();
      });

      it('should return false when input is invalid', () => {
        const input = JSON.parse('{"notadescription": "John Doe"}');
        const deserialized = new Role().tryDeserialize(input);
        expect(deserialized).toBeDefined();
        expect(deserialized[0]).toBe(false);
        expect(deserialized[1]).toBeUndefined();
      });

      it('should return false when parsing fails', () => {
        const user = new Role();
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
