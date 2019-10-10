import { promises as fs } from 'fs';
import { fileExists } from './file';
import * as path from 'path';
import { Hyperfine } from '.';
import * as SimpleGit from 'simple-git/promise';
import * as core from '@actions/core';

const BenchmarkConfig = process.env['BENCHMARK_CONFIG'] || '.hyperfine.js';
const BenchmarkFile = process.env['BENCHMARK_OUTPUT'] || 'benchmarks.json';
const Count = parseInt(process.env['COUNT'] || '100', 10);
const CommitMessage = process.env['GIT_COMMIT_MESSAGE'] || 'Benchmarks update';

/** Typings for .hyperfine.js */
export type HyperfineConfigFile = HyperfineConfig[];
export interface HyperfineConfig {
    name: string;
    command: string;
}

export interface HyperfineResultSuite {
    /** Suite name */
    name: string;
    /** Command that was run */
    command: string;
    mean: number;
    stddev: number;
    median: number;
    user: number;
    system: number;
    min: number;
    max: number;

    /** Number of times the suite was run */
    count: number;
}

export interface HyperfineResult {
    /** Git hash that the test was generated on */
    hash: string;
    /** timestamp for when the test was run*/
    createdAt: string;

    /** List of benchmark results */
    results: HyperfineResultSuite[];
}

function isHyperfineConfig(obj: Record<string, any>): obj is HyperfineConfig[] {
    if (!Array.isArray(obj)) {
        return false;
    }
    return true;
}

/**
 * Load the existing benchmarks from the benchmark file
 */
async function getExistingBenchmarks(): Promise<HyperfineResult[]> {
    const isExistingBenchmarks = await fileExists(BenchmarkFile);
    if (!isExistingBenchmarks) {
        return [];
    }

    const data = await fs.readFile(BenchmarkFile);
    const res = JSON.parse(data.toString());
    if (!Array.isArray(res)) {
        throw new Error(`Corrupted benchmark file, ${BenchmarkFile} is not a JSON array`);
    }
    return res as HyperfineResult[];
}

async function main() {
    const isConfigFound = await fileExists(BenchmarkConfig);
    if (!isConfigFound) {
        throw new Error(`Config file: ${BenchmarkConfig} not found`);
    }

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const config = require(path.join(__dirname, '..', BenchmarkConfig));
    if (!isHyperfineConfig(config)) {
        throw new Error(`Config file: ${BenchmarkConfig} is not a JSON array`);
    }

    const git = SimpleGit();

    const commitHash = await git.revparse(['HEAD']);
    const benchmark: HyperfineResult = {
        hash: commitHash,
        createdAt: new Date().toISOString(),
        results: [],
    };

    for (const suite of config) {
        console.log('Starting benchmark', suite.name);
        const res = await Hyperfine.run(suite.command);
        const count = res.times.length;
        delete res.times;
        benchmark.results.push({
            name: suite.name,
            command: suite.command,
            count,
            ...res,
        });
    }

    const existing = await getExistingBenchmarks();
    existing.unshift(benchmark);
    // Trim the results
    while (Count > 0 && existing.length > Count) {
        existing.pop();
    }

    await fs.writeFile(BenchmarkFile, JSON.stringify(existing, null, 2));
}

main().catch((e: Error) => core.setFailed(e.message));
