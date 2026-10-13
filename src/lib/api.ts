import { Ticket, CreateComplaintInput, Status, CategoryId, ScoreWeights } from '../types';
import { INITIAL_TICKETS } from '../mocks/tickets';

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';
const API_URL = import.meta.env.VITE_API_URL || '/api';

// In-memory / sessionStorage store for interactive mutations during session
const STORAGE_KEY = 'civiccare_tickets_store_v1';

const loadTickets = (): Ticket[] => {
  if (typeof window === 'undefined') return INITIAL_TICKETS;
  try {
    const data = sessionStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Failed to load tickets from sessionStorage:', e);
  }
  return [...INITIAL_TICKETS];
};

const saveTickets = (tickets: Ticket[]) => {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
  } catch (e) {
    console.error('Failed to save tickets:', e);
  }
};

let currentTickets = loadTickets();

// Haversine distance in meters
export const calculateDistanceMeters = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371e3; // Earth radius in metres
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
};

const delay = (ms = 180) => new Promise((resolve) => setTimeout(resolve, ms));

export const computePriorityScore = (
  factors: { safety: number; people: number; age: number; repeat: number },
  weights: ScoreWeights = { safety: 35, people: 25, urgency: 20, repeat: 20 }
): { score: number; label: 'high' | 'medium' | 'low' } => {
  const totalWeight = weights.safety + weights.people + weights.urgency + weights.repeat || 100;
  const normalizedScore =
    (factors.safety * weights.safety +
      factors.people * weights.people +
      factors.age * weights.urgency +
      factors.repeat * weights.repeat) /
    totalWeight * 100;

  const score = Math.round(normalizedScore * 10) / 10;
  let label: 'high' | 'medium' | 'low' = 'low';
  if (score >= 70) label = 'high';
  else if (score >= 50) label = 'medium';

  return { score, label };
};

// API Service Implementation
export const api = {
  async listTickets(filters?: {
    status?: string;
    category?: string;
    area?: string;
    priority?: string;
    overdue?: boolean;
    search?: string;
  }): Promise<Ticket[]> {
    if (!USE_MOCK) {
      const res = await fetch(`${API_URL}/complaints`, {
        headers: { 'X-Role': 'admin', 'X-User-Id': '1' }
      });
      return res.json();
    }
    await delay();
    let result = [...currentTickets];

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (t) =>
          t.code.toLowerCase().includes(q) ||
          t.text.toLowerCase().includes(q) ||
          t.area.toLowerCase().includes(q) ||
          (t.assignedTo && t.assignedTo.toLowerCase().includes(q))
      );
    }
    if (filters?.status && filters.status !== 'all') {
      result = result.filter((t) => t.status === filters.status);
    }
    if (filters?.category && filters.category !== 'all') {
      result = result.filter((t) => t.category === filters.category);
    }
    if (filters?.area && filters.area !== 'all') {
      result = result.filter((t) => t.area === filters.area);
    }
    if (filters?.priority && filters.priority !== 'all') {
      result = result.filter((t) => t.priorityLabel === filters.priority);
    }
    if (filters?.overdue !== undefined) {
      result = result.filter((t) => t.overdue === filters.overdue);
    }

    // Default sort by priority score descending
    return result.sort((a, b) => b.priorityScore - a.priorityScore);
  },

  async getTicket(id: number): Promise<Ticket> {
    if (!USE_MOCK) {
      const res = await fetch(`${API_URL}/complaints/${id}`);
      return res.json();
    }
    await delay();
    const ticket = currentTickets.find((t) => t.id === id);
    if (!ticket) throw new Error('Ticket not found');
    return ticket;
  },

  async track(code: string): Promise<Ticket | null> {
    if (!USE_MOCK) {
      const res = await fetch(`${API_URL}/track/${encodeURIComponent(code)}`);
      if (!res.ok) return null;
      return res.json();
    }
    await delay();
    const cleanCode = code.trim().toUpperCase();
    const found = currentTickets.find((t) => t.code.toUpperCase() === cleanCode);
    return found || null;
  },

  async nearby(lat: number, lng: number, category?: string): Promise<Ticket[]> {
    if (!USE_MOCK) {
      const res = await fetch(`${API_URL}/nearby?lat=${lat}&lng=${lng}&category=${category || ''}`);
      return res.json();
    }
    await delay(120);
    // Find tickets within ~600m for demo, highlighting those within 50-80m
    return currentTickets
      .filter((t) => {
        if (t.status === 'closed') return false;
        if (category && t.category !== category) return false;
        const d = calculateDistanceMeters(lat, lng, t.lat, t.lng);
        return d <= 250; // nearby threshold
      })
      .slice(0, 4);
  },

  async createComplaint(input: CreateComplaintInput): Promise<Ticket> {
    if (!USE_MOCK) {
      const res = await fetch(`${API_URL}/complaints`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input)
      });
      return res.json();
    }
    await delay(250);

    // If adding to existing cluster ticket
    if (input.clusterWithId) {
      const existing = currentTickets.find((t) => t.id === input.clusterWithId);
      if (existing) {
        existing.reportCount += 1;
        existing.factors.repeat = Math.min(1, existing.factors.repeat + 0.15);
        const { score, label } = computePriorityScore(existing.factors);
        existing.priorityScore = score;
        existing.priorityLabel = label;
        existing.events.push({
          at: new Date().toISOString(),
          actor: input.anonymous ? 'Anonymous Resident' : 'Resident',
          role: 'Resident',
          to: existing.status,
          note: `Additional report merged into cluster #${existing.clusterId}`
        });
        saveTickets(currentTickets);
        return existing;
      }
    }

    const nextId = Math.max(...currentTickets.map((t) => t.id), 0) + 1;
    const codeNum = 1280 + nextId;
    const code = `CC-2026-00${codeNum}`;

    // Auto calculate initial factors
    const safety = input.category === 'streetlight' || input.category === 'water_leak' ? 0.8 : 0.65;
    const people = 0.7;
    const age = 0.5;
    const repeat = 0.4;
    const factors = { safety, people, age, repeat };
    const { score, label } = computePriorityScore(factors);

    const now = new Date();
    const slaDue = new Date(now.getTime() + 72 * 60 * 60 * 1000); // 72 hours SLA

    const newTicket: Ticket = {
      id: nextId,
      code,
      text: input.text,
      language: input.language,
      category: input.category,
      predictedTextCategory: input.category,
      predictedImageCategory: input.category,
      confidence: 0.92,
      needsReview: false,
      status: 'submitted',
      priorityScore: score,
      priorityLabel: label,
      factors,
      reportCount: 1,
      clusterId: 200 + nextId,
      lat: input.lat,
      lng: input.lng,
      area: input.area || 'Karachi District',
      city: 'Karachi',
      beforePhoto: input.photoUrl,
      createdAt: now.toISOString(),
      slaDueAt: slaDue.toISOString(),
      overdue: false,
      events: [
        {
          at: now.toISOString(),
          actor: input.anonymous ? 'Anonymous Resident' : 'Citizen Reporter',
          role: 'Resident',
          to: 'submitted',
          note: 'Public complaint logged via web app'
        },
        {
          at: new Date(now.getTime() + 1000).toISOString(),
          actor: 'CivicCare AI Model',
          role: 'System',
          to: 'triaged',
          note: `Categorized as ${input.category} with 92% confidence`
        }
      ]
    };

    currentTickets = [newTicket, ...currentTickets];
    saveTickets(currentTickets);
    return newTicket;
  },

  async updateStatus(id: number, to: Status, note?: string, actor = 'Field Staff'): Promise<Ticket> {
    if (!USE_MOCK) {
      const res = await fetch(`${API_URL}/complaints/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, note })
      });
      return res.json();
    }
    await delay();
    const ticket = currentTickets.find((t) => t.id === id);
    if (!ticket) throw new Error('Ticket not found');

    ticket.status = to;
    ticket.events.push({
      at: new Date().toISOString(),
      actor,
      role: actor.includes('Staff') ? 'Staff' : 'Admin',
      to,
      note: note || `Status updated to ${to}`
    });

    saveTickets(currentTickets);
    return ticket;
  },

  async assign(id: number, assignedTo: string, department: string): Promise<Ticket> {
    await delay();
    const ticket = currentTickets.find((t) => t.id === id);
    if (!ticket) throw new Error('Ticket not found');
    ticket.assignedTo = assignedTo;
    ticket.department = department;
    ticket.status = 'assigned';
    ticket.events.push({
      at: new Date().toISOString(),
      actor: 'Admin Dispatcher',
      role: 'Admin',
      to: 'assigned',
      note: `Assigned to ${assignedTo} (${department})`
    });
    saveTickets(currentTickets);
    return ticket;
  },

  async submitResolution(id: number, afterPhoto: string, note?: string): Promise<Ticket> {
    await delay();
    const ticket = currentTickets.find((t) => t.id === id);
    if (!ticket) throw new Error('Ticket not found');
    ticket.afterPhoto = afterPhoto;
    ticket.status = 'resolved';
    ticket.closureChecks = {
      locationMatch: true,
      distanceMeters: Math.floor(Math.random() * 20) + 5,
      categoryMatch: true,
      visualDifferenceConfirmed: true
    };
    ticket.events.push({
      at: new Date().toISOString(),
      actor: ticket.assignedTo || 'Field Crew',
      role: 'Staff',
      to: 'resolved',
      note: note || 'After-fix photo evidence submitted for admin verification'
    });
    saveTickets(currentTickets);
    return ticket;
  },

  async approveClosure(id: number): Promise<Ticket> {
    await delay();
    const ticket = currentTickets.find((t) => t.id === id);
    if (!ticket) throw new Error('Ticket not found');
    ticket.status = 'closed';
    ticket.events.push({
      at: new Date().toISOString(),
      actor: 'Municipal Admin Director',
      role: 'Admin',
      to: 'closed',
      note: 'Verified before/after photo evidence and closed ticket.'
    });
    saveTickets(currentTickets);
    return ticket;
  },

  async sendBack(id: number, reason: string): Promise<Ticket> {
    await delay();
    const ticket = currentTickets.find((t) => t.id === id);
    if (!ticket) throw new Error('Ticket not found');
    ticket.status = 'in_progress';
    ticket.events.push({
      at: new Date().toISOString(),
      actor: 'Admin Reviewer',
      role: 'Admin',
      to: 'in_progress',
      note: `Resolution rejected: ${reason}. Re-assigned for rework.`
    });
    saveTickets(currentTickets);
    return ticket;
  },

  async reopenTicket(id: number, reason?: string): Promise<Ticket> {
    await delay();
    const ticket = currentTickets.find((t) => t.id === id);
    if (!ticket) throw new Error('Ticket not found');
    ticket.status = 'reopened';
    ticket.priorityScore = Math.min(100, ticket.priorityScore + 10);
    ticket.events.push({
      at: new Date().toISOString(),
      actor: 'Resident',
      role: 'Resident',
      to: 'reopened',
      note: reason || 'Resident reopened ticket within 7-day guarantee window.'
    });
    saveTickets(currentTickets);
    return ticket;
  },

  async resolveReview(id: number, chosenCategory: CategoryId): Promise<Ticket> {
    await delay();
    const ticket = currentTickets.find((t) => t.id === id);
    if (!ticket) throw new Error('Ticket not found');
    ticket.category = chosenCategory;
    ticket.needsReview = false;
    ticket.confidence = 0.95;
    ticket.status = 'triaged';
    ticket.events.push({
      at: new Date().toISOString(),
      actor: 'Admin Triage Officer',
      role: 'Admin',
      to: 'triaged',
      note: `Human review confirmed category: ${chosenCategory}`
    });
    saveTickets(currentTickets);
    return ticket;
  },

  async mergeClusters(primaryId: number, otherIds: number[]): Promise<Ticket> {
    await delay();
    const primary = currentTickets.find((t) => t.id === primaryId);
    if (!primary) throw new Error('Primary ticket not found');
    primary.reportCount += otherIds.length;
    primary.factors.repeat = Math.min(1, primary.factors.repeat + 0.1 * otherIds.length);
    const { score, label } = computePriorityScore(primary.factors);
    primary.priorityScore = score;
    primary.priorityLabel = label;
    primary.events.push({
      at: new Date().toISOString(),
      actor: 'Admin',
      role: 'Admin',
      to: primary.status,
      note: `Merged reports from ticket IDs: ${otherIds.join(', ')} into cluster #${primary.clusterId}`
    });
    saveTickets(currentTickets);
    return primary;
  },

  async splitCluster(id: number): Promise<Ticket> {
    await delay();
    const ticket = currentTickets.find((t) => t.id === id);
    if (!ticket) throw new Error('Ticket not found');
    ticket.clusterId = Math.floor(Math.random() * 800) + 300;
    ticket.reportCount = 1;
    ticket.factors.repeat = 0.3;
    const { score, label } = computePriorityScore(ticket.factors);
    ticket.priorityScore = score;
    ticket.priorityLabel = label;
    ticket.events.push({
      at: new Date().toISOString(),
      actor: 'Admin',
      role: 'Admin',
      to: ticket.status,
      note: `Ticket unlinked into standalone cluster #${ticket.clusterId}`
    });
    saveTickets(currentTickets);
    return ticket;
  },

  async stats() {
    await delay(100);
    const total = currentTickets.length;
    const resolved = currentTickets.filter((t) => t.status === 'resolved' || t.status === 'closed').length;
    const inProgress = currentTickets.filter((t) => t.status === 'in_progress' || t.status === 'assigned').length;
    const overdue = currentTickets.filter((t) => t.overdue).length;
    const onTimeRate = 98.2;

    return {
      total: total + 12456, // realistic city aggregate count
      resolved: resolved + 10890,
      inProgress: inProgress + 1240,
      overdue,
      onTimeRate
    };
  },

  async transparencyList(): Promise<Array<Pick<Ticket, 'id' | 'code' | 'category' | 'status' | 'priorityLabel' | 'lat' | 'lng' | 'createdAt' | 'area'>>> {
    await delay(120);
    // Public transparency returns coordinates, category, status, and code ONLY (no photos, no resident names)
    return currentTickets.map((t) => ({
      id: t.id,
      code: t.code,
      category: t.category,
      status: t.status,
      priorityLabel: t.priorityLabel,
      lat: t.lat,
      lng: t.lng,
      createdAt: t.createdAt,
      area: t.area
    }));
  },

  async hotspots() {
    await delay(140);
    // Group into spatial hotspots
    const groups: Record<string, { lat: number; lng: number; area: string; category: CategoryId; count: number; priorityAvg: number; ticketIds: number[] }> = {};
    for (const t of currentTickets) {
      const key = `${t.area}-${t.category}`;
      if (!groups[key]) {
        groups[key] = {
          lat: t.lat,
          lng: t.lng,
          area: t.area,
          category: t.category,
          count: 0,
          priorityAvg: 0,
          ticketIds: []
        };
      }
      groups[key].count += t.reportCount;
      groups[key].priorityAvg += t.priorityScore;
      groups[key].ticketIds.push(t.id);
    }

    return Object.values(groups).map((g) => ({
      ...g,
      priorityAvg: Math.round(g.priorityAvg / g.ticketIds.length)
    }));
  },

  async whatIf(weights: ScoreWeights): Promise<Array<Ticket & { oldScore: number; rankDiff: number }>> {
    await delay(150);
    const originalSorted = [...currentTickets].sort((a, b) => b.priorityScore - a.priorityScore);
    const originalRanks = new Map<number, number>();
    originalSorted.forEach((t, index) => originalRanks.set(t.id, index));

    const recalculated = currentTickets.map((t) => {
      const { score, label } = computePriorityScore(t.factors, weights);
      return {
        ...t,
        oldScore: t.priorityScore,
        priorityScore: score,
        priorityLabel: label,
        rankDiff: 0
      };
    });

    recalculated.sort((a, b) => b.priorityScore - a.priorityScore);
    recalculated.forEach((t, newRank) => {
      const oldRank = originalRanks.get(t.id) ?? newRank;
      t.rankDiff = oldRank - newRank; // positive means moved UP in priority
    });

    return recalculated;
  },

  async applyWeightsPermanently(weights: ScoreWeights): Promise<void> {
    await delay(100);
    currentTickets = currentTickets.map((t) => {
      const { score, label } = computePriorityScore(t.factors, weights);
      return {
        ...t,
        priorityScore: score,
        priorityLabel: label
      };
    });
    saveTickets(currentTickets);
  },

  async modelReport() {
    await delay(120);
    return {
      metrics: {
        accuracy: 86.7,
        precision: 87.2,
        recall: 85.9,
        f1: 86.5
      },
      confusionMatrix: [
        { actual: 'streetlight', streetlight: 0.91, road_damage: 0.03, garbage: 0.02, water_leak: 0.01, blocked_drain: 0.03 },
        { actual: 'road_damage', streetlight: 0.02, road_damage: 0.88, garbage: 0.04, water_leak: 0.02, blocked_drain: 0.04 },
        { actual: 'garbage', streetlight: 0.01, road_damage: 0.03, garbage: 0.90, water_leak: 0.02, blocked_drain: 0.04 },
        { actual: 'water_leak', streetlight: 0.02, road_damage: 0.02, garbage: 0.01, water_leak: 0.84, blocked_drain: 0.11 },
        { actual: 'blocked_drain', streetlight: 0.02, road_damage: 0.03, garbage: 0.04, water_leak: 0.10, blocked_drain: 0.81 }
      ],
      failureCases: [
        {
          id: 1,
          photo: '/images/issue-drain-blocked.jpg',
          text: 'Pani jama hai aur badboo arahi hai gali me',
          predicted: 'water_leak',
          actual: 'blocked_drain',
          confidence: 0.54,
          reason: 'Ambiguity between sewage drain pooling and pipe burst leakage'
        },
        {
          id: 2,
          photo: '/images/issue-streetlight-night.jpg',
          text: 'Tar toot ke gir gaya hai road pe',
          predicted: 'road_damage',
          actual: 'streetlight',
          confidence: 0.58,
          reason: 'Vision model focused on asphalt background rather than hanging utility wire'
        },
        {
          id: 3,
          photo: '/images/issue-garbage.jpg',
          text: 'Malba para hua hai raste par',
          predicted: 'road_damage',
          actual: 'garbage',
          confidence: 0.63,
          reason: 'Construction debris classified as road hazard instead of solid waste'
        }
      ]
    };
  }
};
