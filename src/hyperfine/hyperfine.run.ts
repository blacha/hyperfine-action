import { exec, ChildProcess } from 'child_process';
import { promises as fs } from 'fs';
import { HyperFineResult, HyperFineJsonOutput } from './hyperfine.output';
import { randomBytes } from 'crypto';
import { fileExists } from '../file';

export const HyperFineCommand = './static/hyperfine'; // tmp.tmpNameSync();


async function waitForChildProcess(child: ChildProcess): Promise<string> {
    const output: string[] = [];
    if (child.stdout == null) {
        throw new Error('Child missing stdout');
    }
    child.stdout.on('data', data => output.push(data));

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
    let isHyperfineInstalled = await fileExists(HyperFineCommand);
    if (!isHyperfineInstalled) {
        throw new Error('Failed to open hyperfine @ ' + HyperFineCommand);
    }

    const outputJsonFile = '/tmp/' + randomBytes(10).toString('hex') + '.json';
    const hyperfineExecute = [HyperFineCommand, `--export-json ${outputJsonFile}`, `'${cmd}'`]; // TODO escape \'

    const output = exec(hyperfineExecute.join(' '));
    const buffer = await waitForChildProcess(output);
    console.log(buffer);

    const outputJsonBuffer = await fs.readFile(outputJsonFile);
    try {
        const res = JSON.parse(outputJsonBuffer.toString()) as HyperFineJsonOutput;
        return res.results[0];
    } finally {
        await fs.unlink(outputJsonFile);
    }
}
