import { equal } from 'node:assert';
import { describe, it } from 'node:test';

import { Hyperfine } from '../index.js';

describe('Hyperfine', () => {
  const VARIANCE = 0.05;

  it('Should get metrics', async () => {
    const sleepTime = 0.05;
    const metrics = await Hyperfine.run(`sleep ${sleepTime}`);

    equal(metrics.command, `sleep ${sleepTime}`);
    equal(Math.abs(metrics.mean - sleepTime) < VARIANCE, true);
    equal(Math.abs(metrics.median - sleepTime) < VARIANCE, true);
    equal(Math.abs(metrics.min - sleepTime) < VARIANCE, true);
    equal(Math.abs(metrics.max - sleepTime) < VARIANCE, true);

    console.log(metrics);
  });
});
