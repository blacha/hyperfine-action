import * as github from '@actions/github';
import { execFileSync } from 'child_process';

const RemoteName = 'hyperfine-action-remote';

export class Git {
  token: string;

  constructor(token: string) {
    this.token = token;
  }

  private git(...args: string[]): string {
    console.log('git', args);
    return execFileSync('git', args).toString().trim();
  }

  async init(): Promise<void> {
    this.git('remote', 'add', RemoteName, this.url);
    this.git('config', '--global', 'user.name', this.actor);
    this.git('config', '--global', 'user.email', this.email);
  }

  get url(): string {
    return `https://x-access-token:${this.token}@github.com/${this.owner}/${this.repo}`;
  }

  get actor(): string {
    return 'hyperfine-action[bot]';
  }

  get owner(): string {
    return github.context.repo.owner;
  }
  get repo(): string {
    return github.context.repo.repo;
  }

  get email(): string {
    return `${this.actor}@users.noreply.github.com`;
  }

  get hash(): string {
    return this.git('rev-parse', 'HEAD');
  }

  fetch(): void {
    this.git('fetch', RemoteName);
  }

  checkout(branchName: string): void {
    this.git('checkout', `${RemoteName}/${branchName}`);
  }

  add(...files: string[]): void {
    this.git('add', ...files);
  }

  status(): void {
    console.log(this.git('status'));
  }

  commit(message: string): void {
    this.git('commit', '-m', message);
    console.log(this.git('show'));
  }

  push(branchName: string): void {
    this.git('push', RemoteName, `HEAD:${branchName}`);
  }
}
