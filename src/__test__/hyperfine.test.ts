import 'source-map-support/register';
import o from 'ospec';
import { Hyperfine } from '../index';

o.spec('Hyperfine', () => {
  const VARIANCE = 0.05;

  o('Should get metrics', async () => {
    const sleepTime = 0.05;
    o.timeout(10000);
    const metrics = await Hyperfine.run(`sleep ${sleepTime}`);

    o(metrics.command).equals(`sleep ${sleepTime}`);
    o(Math.abs(metrics.mean - sleepTime) < VARIANCE).equals(true);
    o(Math.abs(metrics.median - sleepTime) < VARIANCE).equals(true);
    o(Math.abs(metrics.min - sleepTime) < VARIANCE).equals(true);
    o(Math.abs(metrics.max - sleepTime) < VARIANCE).equals(true);

    console.log(metrics);
  });
});
