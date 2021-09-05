export interface HyperFineJsonOutput {
  results: HyperFineResult[];
}

export interface HyperFineResult {
  command: string;
  mean: number;
  stddev: number;
  median: number;
  user: number;
  system: number;
  min: number;
  max: number;
  times?: number[];
}
