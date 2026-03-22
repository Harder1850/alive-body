/** Hibernate-safe mode — preserve state, minimal activity. */
export class HibernateSafe {
  enter(): void {
    // TODO: checkpoint state, disable non-critical systems
  }
}
