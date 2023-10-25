import { exec } from 'child_process';
import { randomBytes } from 'crypto';
import { promises as fs } from 'fs';
import * as path from 'path';
import * as core from '@actions/core';
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

  const upCommand = path.join(__dirname, '..', HyperFineCommand);
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

export async function runHyperfine(cmd: string, extraArgs = {}): Promise<HyperFineResult> {
  core.debug(JSON.stringify(extraArgs));
  const HyperFineCommand = await findHyperfine();

  const outputJsonFile = './' + randomBytes(10).toString('hex') + '.json';
  const hyperfineExecute = [HyperFineCommand, `--export-json ${outputJsonFile}`,
    Object.entries(extraArgs).map((e: any) => `${e[0].length == 1 ? `-${e[0]}` : `--${e[0]}`}${isNaN(e[1]) ? ' ' + JSON.stringify(e[1]) : (typeof e[1] == "boolean") ? "" : ' ' + e[1]}`).join(" "),
    `${JSON.stringify(cmd)}`];
  core.debug(hyperfineExecute.join(" "));
  const buffer = await waitForChildProcess(hyperfineExecute.join(' '));
  console.log(buffer);

  const outputJsonBuffer = await fs.readFile(outputJsonFile);
  try {
    const res = JSON.parse(outputJsonBuffer.toString()) as HyperFineJsonOutput;
    return res.results[0]!;
  } finally {
    await fs.unlink(outputJsonFile);
  }
}
