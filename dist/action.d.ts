export declare type HyperfineConfigFile = HyperfineConfig[];
export interface HyperfineConfig {
    name: string;
    command: string;
}
export interface HyperfineResultSuite {
    name: string;
    command: string;
    mean: number;
    stddev: number;
    median: number;
    user: number;
    system: number;
    min: number;
    max: number;
    count: number;
}
export interface HyperfineResult {
    hash: string;
    createdAt: string;
    results: HyperfineResultSuite[];
}
