import * as shell from 'shelljs';
import * as util from '../utils/fixture';
import { execWithCache } from '../utils/shell';

shell.config.silent = false;

const testDir = 'e2e';
const fixtureName = 'build-withTsconfig';
const stageName = `stage-${fixtureName}`;

describe('tszip build :: build with custom tsconfig.json options', () => {
  beforeAll(() => {
    util.teardownStage(stageName);
    util.setupStageWithFixture(testDir, stageName, fixtureName);
  });

  it('should use the declarationDir when set', () => {
    const output = execWithCache('node ../dist/index.js build');

    expect(shell.test('-f', 'dist/index.js')).toBeTruthy();

    expect(shell.test('-f', 'dist/index.d.ts')).toBeFalsy();
    expect(shell.test('-f', 'typings/index.d.ts')).toBeTruthy();
    expect(shell.test('-f', 'typings/index.d.ts.map')).toBeTruthy();

    expect(output.code).toBe(0);
  });

  it('should read custom --tsconfig path', () => {
    const output = execWithCache(
      'node ../dist/index.js build --tsconfig ./src/tsconfig.json'
    );

    expect(shell.test('-f', 'dist/index.js')).toBeTruthy();
    expect(shell.test('-f', 'dist/index.d.ts')).toBeFalsy();
    expect(shell.test('-f', 'typingsCustom/index.d.ts')).toBeTruthy();
    expect(shell.test('-f', 'typingsCustom/index.d.ts.map')).toBeTruthy();

    expect(output.code).toBe(0);
  });

  afterAll(() => {
    util.teardownStage(stageName);
  });
});
