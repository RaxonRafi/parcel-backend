export interface IUserStats {
  totalUsers: number;
  totalSenders: number;
  totalReceivers: number;
}

export interface IParcelStats {
  totalParcels: number;
  blockedParcels: number;
  canceledParcels: number;
  statusBreakdown: Record<string, number>;

}

export interface IDashboardStats {
  users: IUserStats;
  parcels: IParcelStats;
}