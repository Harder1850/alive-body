/**
 * Base adapter interface.
 * All adapters must implement this.
 */
export interface BaseAdapter {
  name: string;
  send(_command: unknown): Promise<unknown>;
  receive(): Promise<unknown>;
}
