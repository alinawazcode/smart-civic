/**
 * Smart Civic Complaint Triage Engine
 * Lightweight, Ultra-Fast Open-Source Semantic & Geospatial Model Architecture
 * 
 * Features:
 * 1. Client-Side Subword 3-Gram & Domain Embedding Engine (128-dim dense vector)
 * 2. Vector Cosine Similarity Metric with exact normalization
 * 3. Geodesic Haversine Distance computation (meters)
 * 4. Hybrid Civic Match Scoring (Text Semantic 55% + Category 25% + Geo Proximity 20%)
 * 5. Automatic Triage Classifier (Department, Urgency Score 1-100, Priority, SLA hours)
 * 6. Duplicate Cluster Grouping & Deduplication Assist
 */

export interface CivicEmbedding {
  vector: number[];
  norm: number;
}

export interface DuplicateMatch {
  ticketId: number;
  ticketCode: string;
  ticketText: string;
  category: string;
  status: string;
  similarityScore: number; // 0 to 100%
  semanticScore: number;   // 0 to 100%
  distanceMeters: number;
  isSameCategory: boolean;
  matchReasons: string[];
  suggestedAction: 'merge_duplicate' | 'related_issue' | 'unique';
}

export interface TriagePrediction {
  suggestedDepartment: string;
  suggestedCategory: string;
  urgencyScore: number; // 1 to 100
  priority: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;   // 0 to 100%
  slaHours: number;
  identifiedKeywords: string[];
  safetyRiskDetected: boolean;
}

// Domain civic keywords with semantic weights for Pakistani municipal infrastructure
const CIVIC_SEMANTIC_WEIGHTS: Record<string, { dept: string; weight: number; urgency: number }> = {
  // Water & Sewerage (KW&SB / WASA)
  sewer: { dept: 'KW&SB Water & Sanitation', weight: 2.8, urgency: 82 },
  sewerage: { dept: 'KW&SB Water & Sanitation', weight: 2.9, urgency: 84 },
  drain: { dept: 'KW&SB Water & Sanitation', weight: 2.6, urgency: 78 },
  drainage: { dept: 'KW&SB Water & Sanitation', weight: 2.7, urgency: 80 },
  gutter: { dept: 'KW&SB Water & Sanitation', weight: 2.9, urgency: 88 },
  manhole: { dept: 'KW&SB Water & Sanitation', weight: 3.2, urgency: 95 },
  overflow: { dept: 'KW&SB Water & Sanitation', weight: 2.5, urgency: 76 },
  leakage: { dept: 'KW&SB Water & Sanitation', weight: 2.4, urgency: 70 },
  pipeline: { dept: 'KW&SB Water & Sanitation', weight: 2.3, urgency: 68 },
  water: { dept: 'KW&SB Water & Sanitation', weight: 2.0, urgency: 65 },
  contamination: { dept: 'KW&SB Water & Sanitation', weight: 3.0, urgency: 92 },

  // Solid Waste Management (KMC / SSWMB)
  garbage: { dept: 'KMC Solid Waste Management', weight: 2.8, urgency: 72 },
  trash: { dept: 'KMC Solid Waste Management', weight: 2.7, urgency: 70 },
  waste: { dept: 'KMC Solid Waste Management', weight: 2.6, urgency: 68 },
  dump: { dept: 'KMC Solid Waste Management', weight: 2.8, urgency: 74 },
  kundra: { dept: 'KMC Solid Waste Management', weight: 2.9, urgency: 76 },
  stench: { dept: 'KMC Solid Waste Management', weight: 2.2, urgency: 66 },
  litter: { dept: 'KMC Solid Waste Management', weight: 2.1, urgency: 55 },
  debris: { dept: 'KMC Solid Waste Management', weight: 2.4, urgency: 62 },

  // Roads & Infrastructure (KMC Works & Services)
  pothole: { dept: 'Works & Services Department', weight: 2.9, urgency: 80 },
  road: { dept: 'Works & Services Department', weight: 2.2, urgency: 65 },
  crater: { dept: 'Works & Services Department', weight: 2.7, urgency: 82 },
  cave: { dept: 'Works & Services Department', weight: 3.1, urgency: 90 },
  asphalt: { dept: 'Works & Services Department', weight: 2.3, urgency: 60 },
  footpath: { dept: 'Works & Services Department', weight: 2.0, urgency: 52 },
  sidewalk: { dept: 'Works & Services Department', weight: 2.0, urgency: 50 },

  // Electrical & Streetlights (K-Electric / Municipal Electrical)
  streetlight: { dept: 'Sindh Electrical Inspection / Streetlights', weight: 2.7, urgency: 65 },
  light: { dept: 'Sindh Electrical Inspection / Streetlights', weight: 1.8, urgency: 58 },
  pole: { dept: 'Sindh Electrical Inspection / Streetlights', weight: 2.5, urgency: 75 },
  transformer: { dept: 'Sindh Electrical Inspection / Streetlights', weight: 3.2, urgency: 96 },
  spark: { dept: 'Sindh Electrical Inspection / Streetlights', weight: 3.4, urgency: 98 },
  wire: { dept: 'Sindh Electrical Inspection / Streetlights', weight: 3.0, urgency: 90 },
  electrocution: { dept: 'Sindh Electrical Inspection / Streetlights', weight: 3.8, urgency: 100 },
  darkness: { dept: 'Sindh Electrical Inspection / Streetlights', weight: 2.0, urgency: 60 },

  // Environmental & Hazardous (SEPA)
  chemical: { dept: 'Sindh Environmental Protection Agency (SEPA)', weight: 3.3, urgency: 94 },
  toxic: { dept: 'Sindh Environmental Protection Agency (SEPA)', weight: 3.4, urgency: 96 },
  smoke: { dept: 'Sindh Environmental Protection Agency (SEPA)', weight: 2.6, urgency: 72 },
  factory: { dept: 'Sindh Environmental Protection Agency (SEPA)', weight: 2.5, urgency: 70 },
  burning: { dept: 'Sindh Environmental Protection Agency (SEPA)', weight: 3.1, urgency: 88 },

  // Traffic Engineering (TEB)
  signal: { dept: 'Traffic Engineering Bureau', weight: 2.8, urgency: 75 },
  traffic: { dept: 'Traffic Engineering Bureau', weight: 2.2, urgency: 68 },
  jam: { dept: 'Traffic Engineering Bureau', weight: 2.0, urgency: 60 },
  sign: { dept: 'Traffic Engineering Bureau', weight: 1.9, urgency: 50 }
};

// Fixed hash dimension for client-side embedding
const EMBEDDING_DIM = 128;

/**
 * Open-Source Fast Hash function for n-grams
 */
function fastHash(str: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return Math.abs(hash >>> 0);
}

/**
 * Computes a lightweight 128-dimensional dense semantic embedding
 * using subword character 3-grams combined with weighted municipal vocabulary tokens.
 */
export function generateCivicEmbedding(text: string): CivicEmbedding {
  const clean = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
  const words = clean.split(/\s+/).filter((w) => w.length > 1);
  const vector = new Array(EMBEDDING_DIM).fill(0);

  // 1. Process whole word tokens & municipal domain weights
  for (const word of words) {
    const domainMatch = CIVIC_SEMANTIC_WEIGHTS[word];
    const weight = domainMatch ? domainMatch.weight : 1.0;
    const wordIdx = fastHash(word) % EMBEDDING_DIM;
    vector[wordIdx] += weight * 1.5;

    // 2. Extract character 3-grams for robust typo tolerance (e.g., "pot hole", "pothol")
    if (word.length >= 3) {
      for (let i = 0; i <= word.length - 3; i++) {
        const trigram = word.substring(i, i + 3);
        const idx = fastHash(trigram) % EMBEDDING_DIM;
        vector[idx] += 0.4;
      }
    }
  }

  // 3. Compute L2 Norm
  let sumSq = 0;
  for (let i = 0; i < EMBEDDING_DIM; i++) {
    sumSq += vector[i] * vector[i];
  }
  const norm = Math.sqrt(sumSq) || 1e-7;

  // 4. Normalize vector to unit sphere
  for (let i = 0; i < EMBEDDING_DIM; i++) {
    vector[i] = vector[i] / norm;
  }

  return { vector, norm };
}

/**
 * Computes exact cosine similarity between two normalized embeddings (0.0 to 1.0)
 */
export function computeCosineSimilarity(embA: CivicEmbedding, embB: CivicEmbedding): number {
  let dotProduct = 0;
  for (let i = 0; i < EMBEDDING_DIM; i++) {
    dotProduct += embA.vector[i] * embB.vector[i];
  }
  return Math.max(0, Math.min(1, dotProduct));
}

/**
 * Geodesic Haversine Formula for distance between two GPS coordinates in meters
 */
export function computeHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Hybrid Civic Duplicate Detection Engine
 * Scans candidate complaint against existing tickets and ranks potential duplicates
 */
export function findDuplicateComplaints(
  candidateText: string,
  candidateCoords: { lat: number; lng: number } | undefined,
  candidateCategory: string | undefined,
  existingTickets: Array<{
    id: number;
    code: string;
    text: string;
    category?: string;
    status: string;
    lat?: number;
    lng?: number;
    area?: string;
  }>,
  minThreshold: number = 0.50
): DuplicateMatch[] {
  if (!candidateText || candidateText.trim().length < 5) return [];

  const candidateEmb = generateCivicEmbedding(candidateText);
  const matches: DuplicateMatch[] = [];

  for (const ticket of existingTickets) {
    if (!ticket.text) continue;

    const ticketEmb = generateCivicEmbedding(ticket.text);
    const semanticSim = computeCosineSimilarity(candidateEmb, ticketEmb);

    // Compute Physical Distance if coordinates exist
    let distanceMeters = 999999;
    let geoProximityScore = 0; // 0 to 1

    if (
      candidateCoords &&
      candidateCoords.lat &&
      candidateCoords.lng &&
      ticket.lat &&
      ticket.lng
    ) {
      distanceMeters = computeHaversineDistance(
        candidateCoords.lat,
        candidateCoords.lng,
        ticket.lat,
        ticket.lng
      );

      // Distance score decaying smoothly up to 600 meters
      if (distanceMeters <= 50) {
        geoProximityScore = 1.0;
      } else if (distanceMeters <= 150) {
        geoProximityScore = 0.85;
      } else if (distanceMeters <= 300) {
        geoProximityScore = 0.65;
      } else if (distanceMeters <= 600) {
        geoProximityScore = 0.35;
      } else {
        geoProximityScore = 0.05;
      }
    }

    // Category match
    const isSameCategory = Boolean(
      candidateCategory &&
      ticket.category &&
      candidateCategory.toLowerCase() === ticket.category.toLowerCase()
    );
    const categoryScore = isSameCategory ? 1.0 : 0.2;

    // Weighted Hybrid Score
    // Text Semantic: 55%, Category: 25%, Geo Proximity: 20%
    const hybridScore =
      semanticSim * 0.55 +
      categoryScore * 0.25 +
      (geoProximityScore > 0 ? geoProximityScore * 0.20 : semanticSim * 0.20);

    if (hybridScore >= minThreshold) {
      const matchReasons: string[] = [];
      if (semanticSim >= 0.70) matchReasons.push(`High text similarity (${Math.round(semanticSim * 100)}%)`);
      else if (semanticSim >= 0.50) matchReasons.push(`Moderate textual overlap (${Math.round(semanticSim * 100)}%)`);

      if (isSameCategory) matchReasons.push(`Identical issue category (${ticket.category})`);

      if (distanceMeters < 100) matchReasons.push(`Immediate vicinity (${distanceMeters}m away)`);
      else if (distanceMeters < 500) matchReasons.push(`Within same neighborhood block (${distanceMeters}m)`);

      let suggestedAction: 'merge_duplicate' | 'related_issue' | 'unique' = 'unique';
      if (hybridScore >= 0.75 || (semanticSim >= 0.65 && distanceMeters < 150)) {
        suggestedAction = 'merge_duplicate';
      } else if (hybridScore >= 0.55) {
        suggestedAction = 'related_issue';
      }

      matches.push({
        ticketId: ticket.id,
        ticketCode: ticket.code,
        ticketText: ticket.text,
        category: ticket.category || 'General',
        status: ticket.status,
        similarityScore: Math.round(hybridScore * 100),
        semanticScore: Math.round(semanticSim * 100),
        distanceMeters,
        isSameCategory,
        matchReasons,
        suggestedAction
      });
    }
  }

  // Sort by highest hybrid similarity score
  return matches.sort((a, b) => b.similarityScore - a.similarityScore);
}

/**
 * Automatic Triage Classification Engine
 * Analyzes raw complaint description and returns recommended department,
 * urgency index, priority grade, and SLA target.
 */
export function classifyComplaintTriage(
  text: string,
  categoryHint?: string
): TriagePrediction {
  const clean = text.toLowerCase();
  const words = clean.split(/\s+/);
  
  const deptScores: Record<string, number> = {};
  const matchedKeywords: string[] = [];
  let maxUrgency = 40;
  let hasCriticalSafetyHazard = false;

  // Check critical safety flags
  const criticalHazards = ['open manhole', 'sparking', 'bare wire', 'transformer blast', 'electrocution', 'toxic fume', 'child fall'];
  for (const hazard of criticalHazards) {
    if (clean.includes(hazard)) {
      hasCriticalSafetyHazard = true;
      matchedKeywords.push(hazard);
      maxUrgency = Math.max(maxUrgency, 98);
    }
  }

  // Score words against civic dictionary
  for (const word of words) {
    const match = CIVIC_SEMANTIC_WEIGHTS[word];
    if (match) {
      matchedKeywords.push(word);
      deptScores[match.dept] = (deptScores[match.dept] || 0) + match.weight * 10;
      maxUrgency = Math.max(maxUrgency, match.urgency);
    }
  }

  // Sort department predictions
  const sortedDepts = Object.entries(deptScores).sort((a, b) => b[1] - a[1]);
  const suggestedDepartment =
    sortedDepts.length > 0
      ? sortedDepts[0][0]
      : 'Karachi Municipal Corporation (KMC)';

  // Category mapping
  let suggestedCategory = categoryHint || 'Other';
  if (suggestedDepartment.includes('Water')) suggestedCategory = 'Sewage / Water';
  else if (suggestedDepartment.includes('Solid Waste')) suggestedCategory = 'Garbage / Sanitation';
  else if (suggestedDepartment.includes('Streetlights')) suggestedCategory = 'Electrical / Streetlights';
  else if (suggestedDepartment.includes('Works & Services')) suggestedCategory = 'Potholes / Roads';
  else if (suggestedDepartment.includes('Environmental')) suggestedCategory = 'Hazardous / Chemical';
  else if (suggestedDepartment.includes('Traffic')) suggestedCategory = 'Traffic / Signs';

  // Priority grading based on calculated urgency
  let priority: 'low' | 'medium' | 'high' | 'critical' = 'medium';
  let slaHours = 48;

  if (hasCriticalSafetyHazard || maxUrgency >= 90) {
    priority = 'critical';
    slaHours = 12;
  } else if (maxUrgency >= 75) {
    priority = 'high';
    slaHours = 24;
  } else if (maxUrgency >= 55) {
    priority = 'medium';
    slaHours = 48;
  } else {
    priority = 'low';
    slaHours = 72;
  }

  const confidence = Math.min(98, Math.max(65, 50 + matchedKeywords.length * 12));

  return {
    suggestedDepartment,
    suggestedCategory,
    urgencyScore: maxUrgency,
    priority,
    confidence,
    slaHours,
    identifiedKeywords: Array.from(new Set(matchedKeywords)),
    safetyRiskDetected: hasCriticalSafetyHazard
  };
}
