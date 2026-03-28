/**
 * File System Watcher Adapter
 * Watches a directory for change events and queues them as Signals with source 'telemetry'.
 * Carry-only: no interpretation, no decisions.
 *
 * Usage:
 *   const adapter = new FsWatcherAdapter('/path/to/watch');
 *   adapter.start();
 *   const signal = await adapter.receive();  // next queued event, or null if idle
 *   adapter.stop();
 */

import type { Signal } from '../../../alive-constitution/contracts/signal';
import { watch, FSWatcher } from 'fs';
import { BaseAdapter } from './base-adapter';

export interface FsChangeReading {
  event: 'rename' | 'change';
  filename: string | null;
  watch_path: string;
}

export class FsWatcherAdapter implements BaseAdapter {
  name = 'fs-watcher-adapter';

  private readonly watchPath: string;
  private watcher: FSWatcher | null = null;
  private readonly queue: FsChangeReading[] = [];

  constructor(watchPath: string) {
    this.watchPath = watchPath;
  }

  start(): void {
    if (this.watcher) return;
    this.watcher = watch(this.watchPath, { recursive: true }, (event, filename) => {
      this.queue.push({
        event,
        filename: filename ? String(filename) : null,
        watch_path: this.watchPath,
      });
    });
  }

  stop(): void {
    this.watcher?.close();
    this.watcher = null;
  }

  async send(_command: unknown): Promise<unknown> {
    return null;
  }

  /** Returns a Signal for the next queued fs event, or null raw_content if the queue is empty. */
  async receive(): Promise<Signal> {
    const reading = this.queue.shift() ?? null;
    return {
      id: crypto.randomUUID(),
      source: 'telemetry',
      raw_content: reading,
      timestamp: Date.now(),
      threat_flag: false,
      firewall_status: 'pending',
    };
  }
}
