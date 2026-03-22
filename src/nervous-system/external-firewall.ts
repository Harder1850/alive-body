/** External firewall — gates all input and output. */
export class ExternalFirewall {
  checkInput(_signal: unknown): boolean {
    // TODO: implement input validation
    return true;
  }

  checkOutput(_action: unknown): boolean {
    // TODO: implement output validation
    return true;
  }
}
