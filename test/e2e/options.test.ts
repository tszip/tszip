import * as shell from 'shelljs';
import * as util from '../utils/fixture';
// import { execWithCache, grep } from '../utils/shell';

shell.config.silent = false;

const testDir = 'e2e';
const fixtureName = 'build-default';
// create a second version of build-default's stage for concurrent testing
const stageName = 'stage-build-options';

describe('tszip build :: options', () => {
  beforeAll(() => {
    util.teardownStage(stageName);
    util.setupStageWithFixture(testDir, stageName, fixtureName);
  });

  // TODO: Add --noMinify test
  test.todo('--noMinify test');

  afterAll(() => {
    util.teardownStage(stageName);
  });
});
