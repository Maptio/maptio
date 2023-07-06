import { GlobalEntity } from './global.models';
import {
  globalAdapter,
  GlobalPartialState,
  initialGlobalState,
} from './global.reducer';
import * as GlobalSelectors from './global.selectors';

describe('Global Selectors', () => {
  const ERROR_MSG = 'No Error Available';
  const getGlobalId = (it: GlobalEntity) => it.id;
  const createGlobalEntity = (id: string, name = '') =>
    ({
      id,
      name: name || `name-${id}`,
    } as GlobalEntity);

  let state: GlobalPartialState;

  beforeEach(() => {
    state = {
      global: globalAdapter.setAll(
        [
          createGlobalEntity('PRODUCT-AAA'),
          createGlobalEntity('PRODUCT-BBB'),
          createGlobalEntity('PRODUCT-CCC'),
        ],
        {
          ...initialGlobalState,
          selectedId: 'PRODUCT-BBB',
          error: ERROR_MSG,
          loaded: true,
        }
      ),
    };
  });

  describe('Global Selectors', () => {
    it('selectAllGlobal() should return the list of Global', () => {
      const results = GlobalSelectors.selectAllGlobal(state);
      const selId = getGlobalId(results[1]);

      expect(results.length).toBe(3);
      expect(selId).toBe('PRODUCT-BBB');
    });

    it('selectEntity() should return the selected Entity', () => {
      const result = GlobalSelectors.selectEntity(state) as GlobalEntity;
      const selId = getGlobalId(result);

      expect(selId).toBe('PRODUCT-BBB');
    });

    it('selectGlobalLoaded() should return the current "loaded" status', () => {
      const result = GlobalSelectors.selectGlobalLoaded(state);

      expect(result).toBe(true);
    });

    it('selectGlobalError() should return the current "error" state', () => {
      const result = GlobalSelectors.selectGlobalError(state);

      expect(result).toBe(ERROR_MSG);
    });
  });
});
