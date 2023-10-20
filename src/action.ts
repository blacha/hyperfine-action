import * as core from '@actions/core';
import * as github from '@actions/github';
import { promises as fs } from 'fs';
import * as path from 'path';

import { BenchmarkHtml } from './benchmark.template.js';
import { fileExists } from './file.js';
import { Git } from './git.js';
import { Hyperfine } from './index.js';

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

function isHyperfineConfig(obj: Record<string, unknown>): obj is HyperfineConfig[] {
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
  if (!isExistingBenchmarks) return [];

  const data = await fs.readFile(benchmarkFile);
  const res = JSON.parse(data.toString());
  if (!Array.isArray(res)) {
    throw new Error(`Corrupted benchmark file, ${benchmarkFile} is not a JSON array`);
  }
  return res as HyperfineResult[];
}

async function main(): Promise<void> {
  const BenchmarkConfig = core.getInput('benchmark-config');
  const BenchmarkFile = core.getInput('benchmark-output');
  const BenchmarkHtmlFile = core.getInput('benchmark-html');
  const Count = parseInt(core.getInput('count'), 10);

  const workspace = process.env['GITHUB_WORKSPACE'];
  if (workspace == null) throw new Error(`Failed to read workspace "$GITHUB_WORKSPACE"`);

  const configPath = path.join(workspace, BenchmarkConfig);

  const isConfigFound = await fileExists(configPath);
  if (!isConfigFound) throw new Error(`Config file: ${configPath} not found`);

  const config = JSON.parse((await fs.readFile(configPath)).toString());
  if (!isHyperfineConfig(config)) throw new Error(`Config file: ${configPath} is not a JSON array`);

  const git = new Git(core.getInput('github-token'));

  const benchmark: HyperfineResult = {
    hash: git.hash,
    createdAt: new Date().toISOString(),
    results: [],
  };

  for (const suite of config) {
    core.debug(`Starting benchmark: ${suite.name}`);
    const res = await Hyperfine.run(suite.command);
    const count = res.times?.length ?? 0;
    delete res.times;
    benchmark.results.push({
      name: suite.name,
      count,
      ...res,
    });
  }
  const masterBranch = core.getInput('master-branch');
  const isMasterBranch = `refs/heads/${masterBranch}` === github.context.ref;

  const benchmarkBranch = core.getInput('benchmark-branch');

  core.debug('Checkout benchmark branch: ' + benchmarkBranch);
  git.init();
  git.fetch();
  try {
    git.checkout(benchmarkBranch);
  } catch (e) {
    core.warning(`Failed to checkout benchmark branch: ${benchmarkBranch} skipping comparision`);
    return;
  }

  const existing = await getExistingBenchmarks(BenchmarkFile);
  existing.unshift(benchmark);
  // Trim the results
  while (Count > 0 && existing.length > Count) existing.pop();

  await fs.writeFile(BenchmarkFile, JSON.stringify(existing, null, 2));

  if (isMasterBranch) {
    const htmlExists = await fileExists(BenchmarkHtmlFile);
    if (!htmlExists) {
      await fs.writeFile(BenchmarkHtmlFile, BenchmarkHtml);
      git.add(BenchmarkHtmlFile);
    }

    core.debug('Pushing changes to branch: ' + benchmarkBranch);
    git.add(BenchmarkFile);
    git.commit('benchmark: publish for ' + git.hash);
    git.push(benchmarkBranch);
  } else {
    core.debug('Skipping publish');
  }
}

main().catch((e: Error) => core.setFailed(e.message));
