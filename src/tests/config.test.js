import { describe, it, expect } from 'vitest';
import { CONFIG_LIST, API_TYPE } from '../config';

describe('CONFIG_LIST', () => {
  it('every endpoint has at least one apiType with a defined routerUrl', () => {
    CONFIG_LIST.forEach(config => {
      const availableTypes = Object.values(API_TYPE).filter(
        type => config.routerUrl[type],
      );
      expect(
        availableTypes.length,
        `${config.title} has no routerUrl for any apiType`,
      ).toBeGreaterThan(0);
    });
  });
});
