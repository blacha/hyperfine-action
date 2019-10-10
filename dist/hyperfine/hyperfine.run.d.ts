import { HyperFineResult } from './hyperfine.output';
export declare function waitForChildProcess(cmd: string): Promise<string>;
export declare function runHyperfine(cmd: string): Promise<HyperFineResult>;
