export interface DashboardQueryParams {
  agenceId?: string;
  dateDebut?: string;
  dateFin?: string;
}

export interface DashboardKPIs {
  chiffreAffairesTotal: number;
  totalEncaisse: number;
  resteARecouvrer: number; // Correspond au totalSolde (impayés/crédits)
  nombreTransactions: number;
  tauxRecouvrement: number; // Pourcentage encaisse / CA
}

export interface TopKiosqueStat {
  kiosque: string;
  totalVente: number;
  totalSolde: number;
  nombreVentes: number;
}

export interface TopAgentStat {
  agent: string;
  totalVente: number;
  nombreVentes: number;
}