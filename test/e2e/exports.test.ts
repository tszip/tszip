import { readFile } from 'fs/promises';
import * as shell from 'shelljs';
import * as util from '../utils/fixture';
import { execWithCache } from '../utils/shell';

shell.config.silent = false;

const testDir = 'e2e';
const fixtureName = 'build-exports';
const stageName = `stage-${fixtureName}`;

describe('tsdx build :: exports', () => {
  beforeAll(() => {
    util.teardownStage(stageName);
    util.setupStageWithFixture(testDir, stageName, fixtureName);
  });

  it('should compile files into a dist directory', () => {
    const output = execWithCache('node ../dist/index.mjs build');

    expect(shell.test('-f', 'dist/index.mjs')).toBeTruthy();
    expect(shell.test('-f', 'dist/index.d.ts')).toBeTruthy();

    expect(output.code).toBe(0);
  });

  /**
   * Directory resolution does not make sense here. readFile looks for
   * ./stageName, but node is run in ../stageName, yet they are both apparently
   * the same directory.
   *
   * @todo Make less stupid.
   */
  describe('library exports', () => {
    let json = readFile(`./${stageName}/package.json`, 'utf-8');

    it('should set package.json `exports` field', async () => {
      const packageJson = JSON.parse(await json);
      expect(packageJson.exports).toBeTruthy();
    });

    it('should export `my-package/path/to/module` as my-package/path/to/module.mjs', async () => {
      const packageJson = JSON.parse(await json);
      expect(packageJson.exports['.']).toEqual('./dist/index.mjs');
      expect(packageJson.exports['./*']).toEqual('./dist/*.mjs');
    });

    it('should export named members properly', () => {
      const output = execWithCache(`node ../${stageName}/exports.named.mjs`);
      expect(output.code).toBe(0);
    });

    it('should export default members properly', () => {
      const output = execWithCache(`node ../${stageName}/exports.default.mjs`);
      expect(output.code).toBe(0);
    });
  });

  afterAll(() => {
    util.teardownStage(stageName);
  });
});
