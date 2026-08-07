import { AsyncLocalStorage } from "async_hooks";

export interface RequestContext {
  userId: string;
  agenceId: string | null;
  agenceNom?: string | null;
  dataScope: "GLOBAL" | "AGENCE";
}

export const contextStorage = new AsyncLocalStorage<RequestContext>();
