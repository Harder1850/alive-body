export type ActionHandler = (params: Record<string, unknown>) => void;

export const actionRegistry: Record<string, ActionHandler> = {
  log: (params) => {
    console.log("[ALIVE-BODY][LOG]", (params as any).message);
  },

  notify: (params) => {
    console.log("[ALIVE-BODY][NOTIFY]", (params as any).channel, (params as any).message);
  },
};
