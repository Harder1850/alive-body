import { InternetRequest } from './internetRequest';
import { InternetResponse } from './internetResponse';

export interface InternetAdapter {
  /**
   * Performs a network operation after execution approval.
   * No retries, no caching, no interpretation.
   */
  request(req: InternetRequest): Promise<InternetResponse>;
}