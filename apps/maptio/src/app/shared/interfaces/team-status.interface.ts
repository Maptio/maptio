export interface TeamStatus {
  created_at: Date;
  freeTrialLength: number;
  isPaying: boolean;
  plan: string;
  maxMembers: number;
  price: number;
}
