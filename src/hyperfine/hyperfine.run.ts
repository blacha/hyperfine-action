import { exec } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { readFile, unlink } from 'node:fs/promises';
import { join } from 'node:path';

import { fileExists } from '../file.js';
import { HyperFineJsonOutput, HyperFineResult } from './hyperfine.output.js';

/**
 * Sometimes we can access hyperfine with ./
 * sometimes we need __dirname, lets try both to be safe
 */
async function findHyperfine(): Promise<string> {
  const HyperFineCommand = './static/hyperfine'; // tmp.tmpNameSync();

  const isHyperfineInstalled = await fileExists(HyperFineCommand);
  if (isHyperfineInstalled) {
    return HyperFineCommand;
  }

  const upCommand = join(__dirname, '..', HyperFineCommand);
  const isHyperfineInstalledUp = await fileExists(upCommand);
  if (isHyperfineInstalledUp) {
    return upCommand;
  }
  throw new Error('Failed to open hyperfine @ ' + HyperFineCommand);
}

export async function waitForChildProcess(cmd: string): Promise<string> {
  const child = exec(cmd);

  const output: string[] = [];
  if (child.stdout == null) {
    throw new Error('Child missing stdout');
  }
  child.stdout.on('data', (data) => output.push(data));

  return new Promise((resolve, reject) => {
    child.addListener('error', reject);
    child.addListener('exit', (code: number) => {
      if (code === 0) {
        return resolve(output.join(''));
      }
      return reject(new Error('Hyperfine exited with code: ' + code));
    });
  });
}

export async function runHyperfine(cmd: string): Promise<HyperFineResult> {
  const HyperFineCommand = await findHyperfine();

  const outputJsonFile = './' + randomBytes(10).toString('hex') + '.json';
  const hyperfineExecute = [HyperFineCommand, `--export-json ${outputJsonFile}`, `'${cmd}'`]; // TODO escape \'

  const buffer = await waitForChildProcess(hyperfineExecute.join(' '));
  console.log(buffer);

  const outputJsonBuffer = await readFile(outputJsonFile);
  try {
    const res = JSON.parse(outputJsonBuffer.toString()) as HyperFineJsonOutput;
    return res.results[0]!;
  } finally {
    await unlink(outputJsonFile);
  }
}
