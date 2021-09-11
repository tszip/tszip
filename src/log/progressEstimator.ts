import * as fs from 'fs-extra';

import progressEstimator from 'progress-estimator';
import { progressEstimatorCachePath } from '../lib/paths';

export async function createProgressEstimator() {
  await fs.ensureDir(progressEstimatorCachePath);
  return progressEstimator({
    // All configuration keys are optional, but it's recommended to specify a storage location.
    storagePath: progressEstimatorCachePath,
  });
}
