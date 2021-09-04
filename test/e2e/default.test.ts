import * as shell from 'shelljs';

import * as util from '../utils/fixture';
import { execWithCache } from '../utils/shell';

shell.config.silent = false;

const testDir = 'e2e';
const fixtureName = 'build-default';
const stageName = `stage-${fixtureName}`;

describe('tszip build :: zero-config defaults', () => {
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

  it("shouldn't compile files in test/ or types/", () => {
    const output = execWithCache('node ../dist/index.mjs build');

    expect(shell.test('-d', 'dist/test/')).toBeFalsy();
    expect(shell.test('-d', 'dist/types/')).toBeFalsy();

    expect(output.code).toBe(0);
  });

  it('should clean the dist directory before rebuilding', () => {
    let output = execWithCache('node ../dist/index.mjs build');
    expect(output.code).toBe(0);

    shell.mv('package.json', 'package-og.json');
    shell.mv('package2.json', 'package.json');

    // cache bust because we want to re-run this command with new package.json
    output = execWithCache('node ../dist/index.mjs build', {
      noCache: true,
    });
    expect(shell.test('-f', 'dist/index.mjs')).toBeTruthy();
  });

  afterAll(() => {
    util.teardownStage(stageName);
  });
});
