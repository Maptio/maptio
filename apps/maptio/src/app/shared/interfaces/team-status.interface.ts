export interface TeamStatus {
  created_at: Date;
  freeTrialLength: number;
  isPaying: Boolean;
  plan: string;
  maxMembers: number;
  price: number;
}
