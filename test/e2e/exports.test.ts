import { readFileSync } from 'fs';
import { execWithCache } from '../utils/shell';

import * as shell from 'shelljs';
import * as util from '../utils/fixture';

shell.config.silent = false;

const testDir = 'e2e';
const fixtureName = 'build-exports';
const stageName = `stage-${fixtureName}`;

describe('tszip build :: exports', () => {
  beforeAll(() => {
    util.teardownStage(stageName);
    util.setupStageWithFixture(testDir, stageName, fixtureName);
  });

  describe('library exports', () => {
    it('should set package.json `exports` field', () => {
      const json = readFileSync(`package.json`, 'utf-8');
      const packageJson = JSON.parse(json);
      expect(packageJson.exports).toBeTruthy();
    });

    it('should export `my-package/path/to/module` as my-package/path/to/module.js', () => {
      const json = readFileSync(`package.json`, 'utf-8');
      const packageJson = JSON.parse(json);
      expect(packageJson.exports['.']).toEqual('./dist/index.js');
      expect(packageJson.exports['./*']).toEqual('./dist/*.js');
    });

    it('should build the project', () => {
      execWithCache('node ../dist/index.js build');
    });

    it('should export named members properly', () => {
      const named = execWithCache(`node exports.named.js`);
      expect(named.code).toBe(0);
    });

    it('should export default members properly', () => {
      const def = execWithCache(`node exports.default.js`);
      expect(def.code).toBe(0);
    });
  });

  afterAll(() => {
    util.teardownStage(stageName);
  });
});
