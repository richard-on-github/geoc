declare module "express-serve-static-core" {
  interface Request {
    user?: {
      id: string;
      agenceId: string | null;
      role: {
        id: string;
        nom: string;
        niveau:number;
        dataScope: string;
        isSystem: boolean;
      };
      // dataScope: "GLOBAL" | "AGENCE";

      permissions?: string[];
    };

    dataScopeWhere?: {
      agenceId?: string;
    };
  }
}

export {};
