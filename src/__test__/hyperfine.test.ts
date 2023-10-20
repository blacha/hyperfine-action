import { describe, it } from 'node:test';
import assert from 'node:assert';
import { Hyperfine } from '../index';

describe('Hyperfine', () => {
  const VARIANCE = 0.05;

  it('Should get metrics', async () => {
    const sleepTime = 0.05;
    const metrics = await Hyperfine.run(`sleep ${sleepTime}`);

    assert.equal(metrics.command, `sleep ${sleepTime}`);
    assert.equal(Math.abs(metrics.mean - sleepTime) < VARIANCE, true);
    assert.equal(Math.abs(metrics.median - sleepTime) < VARIANCE, true);
    assert.equal(Math.abs(metrics.min - sleepTime) < VARIANCE, true);
    assert.equal(Math.abs(metrics.max - sleepTime) < VARIANCE, true);

    console.log(metrics);
  });
});
