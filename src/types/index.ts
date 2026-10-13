export type Role = 'resident' | 'staff' | 'admin';

export type Status =
  | 'submitted'
  | 'triaged'
  | 'assigned'
  | 'in_progress'
  | 'on_hold'
  | 'resolved'
  | 'closed'
  | 'reopened';

export type CategoryId =
  | 'streetlight'
  | 'road_damage'
  | 'garbage'
  | 'water_leak'
  | 'blocked_drain';

export interface TicketFactors {
  safety: number;  // 0..1 (Public safety risk)
  people: number;  // 0..1 (People affected / population impact)
  age: number;     // 0..1 (Urgency / age vs SLA)
  repeat: number;  // 0..1 (Frequency / repeat complaints)
}

export interface TicketEvent {
  at: string;
  actor: string;
  role: string;
  to: Status;
  note?: string;
}

export interface Ticket {
  id: number;
  code: string;                 // e.g. "CC-2026-001238"
  text: string;
  language: 'en' | 'ur' | 'roman-ur';
  category: CategoryId;
  predictedTextCategory?: CategoryId;
  predictedImageCategory?: CategoryId;
  confidence: number;           // 0..1
  needsReview: boolean;
  status: Status;
  priorityScore: number;        // 0..100
  priorityLabel: 'high' | 'medium' | 'low';
  factors: TicketFactors;
  reportCount: number;
  clusterId: number;
  lat: number;
  lng: number;
  area: string;                 // e.g. "Gulshan-e-Iqbal"
  city: string;
  beforePhoto: string;
  afterPhoto?: string;
  assignedTo?: string;
  department?: string;
  createdAt: string;
  slaDueAt: string;
  overdue: boolean;
  events: TicketEvent[];
  // Automated closure check flags
  closureChecks?: {
    locationMatch: boolean;
    distanceMeters: number;
    categoryMatch: boolean;
    visualDifferenceConfirmed: boolean;
  };
}

export interface ScoreWeights {
  safety: number;  // default 35
  people: number;  // default 25
  urgency: number; // default 20
  repeat: number;  // default 20
}

export interface CreateComplaintInput {
  category: CategoryId;
  text: string;
  language: 'en' | 'ur' | 'roman-ur';
  lat: number;
  lng: number;
  area: string;
  photoUrl: string;
  anonymous?: boolean;
  contact?: string;
  clusterWithId?: number;
}
