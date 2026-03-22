/**
 * ADAPTER TEMPLATE
 * Adapters connect Body to external systems.
 * They CARRY data — they do not interpret or decide.
 */
import { BaseAdapter } from "./base-adapter";

export class YourAdapter implements BaseAdapter {
  name = "your-adapter";

  async send(_command: unknown): Promise<unknown> {
    // TODO: implement
    return null;
  }

  async receive(): Promise<unknown> {
    // TODO: implement
    return null;
  }
}
