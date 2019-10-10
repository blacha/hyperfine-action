import { promises as fs } from 'fs';
import { fileExists } from './file';
import * as path from 'path';
import { Hyperfine } from '.';
import * as SimpleGit from 'simple-git/promise';
import * as core from '@actions/core';

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
async function getExistingBenchmarks(benchmarkFile: string): Promise<HyperfineResult[]> {
    const isExistingBenchmarks = await fileExists(benchmarkFile);
    if (!isExistingBenchmarks) {
        return [];
    }

    const data = await fs.readFile(benchmarkFile);
    const res = JSON.parse(data.toString());
    if (!Array.isArray(res)) {
        throw new Error(`Corrupted benchmark file, ${benchmarkFile} is not a JSON array`);
    }
    return res as HyperfineResult[];
}

async function main() {
    const BenchmarkConfig = core.getInput('benchmark_config');
    const BenchmarkFile = core.getInput('benchmark_output');
    const Count = parseInt(core.getInput('count'), 10);
    const CommitMessage = core.getInput('commit_message');

    const isConfigFound = await fileExists(BenchmarkConfig);
    if (!isConfigFound) {
        throw new Error(`Config file: ${BenchmarkConfig} not found`);
    }

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const config = require('./' + BenchmarkConfig);
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

    const existing = await getExistingBenchmarks(BenchmarkFile);
    existing.unshift(benchmark);
    // Trim the results
    while (Count > 0 && existing.length > Count) {
        existing.pop();
    }

    await fs.writeFile(BenchmarkFile, JSON.stringify(existing, null, 2));
}

main().catch((e: Error) => core.setFailed(e.message));
