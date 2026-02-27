
export enum PartnerType {
  HUSBAND = 'HUSBAND',
  WIFE = 'WIFE'
}

export interface ScoreSet {
  domain1: number; // Respect (H) or Safety (W)
  domain2: number; // Admired (H) or Cared For (W)
  domain3: number; // Physical Intimacy (H) or Known (W)
  overall: number;
}

export interface SurveyEntry {
  id: string;
  coupleId: string;
  date: string;
  partnerType: PartnerType;
  scores: ScoreSet;
  notes: string[];
}

export interface CoupleProfile {
  id: string;
  husbandEmail: string;
  wifeEmail: string;
  startDate: string;
}

export interface User {
  id: string;
  email: string;
  partnerType: PartnerType;
  coupleId: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  couple: CoupleProfile;
  entries: SurveyEntry[];
}

export interface ChartDataPoint {
  date: string;
  h_overall?: number;
  w_overall?: number;
  h_d1?: number; // Respect
  w_d1?: number; // Safety
  h_d2?: number; // Admired
  w_d2?: number; // Cared For
  h_d3?: number; // Intimacy
  w_d3?: number; // Known
}
