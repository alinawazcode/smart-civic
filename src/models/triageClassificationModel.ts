/**
 * Smart Civic Triage Classification Model
 * Natural Language multi-class classifier and urgency prediction engine.
 */

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

export const CIVIC_SEMANTIC_WEIGHTS: Record<string, { dept: string; cat: string; weight: number; urgency: number; safetyRisk?: boolean }> = {
  // Water & Sewerage (KW&SB / WASA)
  sewer: { dept: 'KW&SB Water & Sanitation', cat: 'water_leak', weight: 2.8, urgency: 82 },
  sewerage: { dept: 'KW&SB Water & Sanitation', cat: 'water_leak', weight: 2.9, urgency: 84 },
  drain: { dept: 'KW&SB Water & Sanitation', cat: 'blocked_drain', weight: 2.6, urgency: 78 },
  drainage: { dept: 'KW&SB Water & Sanitation', cat: 'blocked_drain', weight: 2.7, urgency: 80 },
  gutter: { dept: 'KW&SB Water & Sanitation', cat: 'blocked_drain', weight: 2.9, urgency: 88, safetyRisk: true },
  manhole: { dept: 'KW&SB Water & Sanitation', cat: 'blocked_drain', weight: 3.2, urgency: 95, safetyRisk: true },
  overflow: { dept: 'KW&SB Water & Sanitation', cat: 'water_leak', weight: 2.5, urgency: 76 },
  leakage: { dept: 'KW&SB Water & Sanitation', cat: 'water_leak', weight: 2.4, urgency: 70 },
  pipeline: { dept: 'KW&SB Water & Sanitation', cat: 'water_leak', weight: 2.3, urgency: 68 },
  water: { dept: 'KW&SB Water & Sanitation', cat: 'water_leak', weight: 2.0, urgency: 65 },
  contamination: { dept: 'KW&SB Water & Sanitation', cat: 'water_leak', weight: 3.0, urgency: 92, safetyRisk: true },

  // Solid Waste Management (KMC / SSWMB)
  garbage: { dept: 'KMC Solid Waste Management', cat: 'garbage', weight: 2.8, urgency: 72 },
  trash: { dept: 'KMC Solid Waste Management', cat: 'garbage', weight: 2.7, urgency: 70 },
  waste: { dept: 'KMC Solid Waste Management', cat: 'garbage', weight: 2.6, urgency: 68 },
  dump: { dept: 'KMC Solid Waste Management', cat: 'garbage', weight: 2.8, urgency: 74 },
  kundra: { dept: 'KMC Solid Waste Management', cat: 'garbage', weight: 2.9, urgency: 76 },
  stench: { dept: 'KMC Solid Waste Management', cat: 'garbage', weight: 2.2, urgency: 66 },
  litter: { dept: 'KMC Solid Waste Management', cat: 'garbage', weight: 2.1, urgency: 55 },
  debris: { dept: 'KMC Solid Waste Management', cat: 'garbage', weight: 2.4, urgency: 62 },

  // Roads & Infrastructure (KMC Works & Services)
  pothole: { dept: 'Works & Services Department', cat: 'road_damage', weight: 2.9, urgency: 80 },
  road: { dept: 'Works & Services Department', cat: 'road_damage', weight: 2.2, urgency: 65 },
  crater: { dept: 'Works & Services Department', cat: 'road_damage', weight: 2.7, urgency: 82, safetyRisk: true },
  cave: { dept: 'Works & Services Department', cat: 'road_damage', weight: 3.1, urgency: 90, safetyRisk: true },
  asphalt: { dept: 'Works & Services Department', cat: 'road_damage', weight: 2.3, urgency: 60 },
  footpath: { dept: 'Works & Services Department', cat: 'road_damage', weight: 2.0, urgency: 52 },

  // Electrical & Streetlights
  streetlight: { dept: 'Sindh Electrical Inspection / Streetlights', cat: 'streetlight', weight: 2.7, urgency: 65 },
  light: { dept: 'Sindh Electrical Inspection / Streetlights', cat: 'streetlight', weight: 1.8, urgency: 58 },
  pole: { dept: 'Sindh Electrical Inspection / Streetlights', cat: 'streetlight', weight: 2.5, urgency: 75 },
  transformer: { dept: 'Sindh Electrical Inspection / Streetlights', cat: 'streetlight', weight: 3.2, urgency: 96, safetyRisk: true },
  spark: { dept: 'Sindh Electrical Inspection / Streetlights', cat: 'streetlight', weight: 3.4, urgency: 98, safetyRisk: true },
  wire: { dept: 'Sindh Electrical Inspection / Streetlights', cat: 'streetlight', weight: 3.0, urgency: 90, safetyRisk: true },
  electrocution: { dept: 'Sindh Electrical Inspection / Streetlights', cat: 'streetlight', weight: 3.8, urgency: 100, safetyRisk: true },
  darkness: { dept: 'Sindh Electrical Inspection / Streetlights', cat: 'streetlight', weight: 2.0, urgency: 60 }
};

export const TriageClassificationModel = {
  /**
   * Classify complaint text into department, category, and urgency SLA
   */
  classify(text: string, selectedCategory?: string): TriagePrediction {
    const clean = (text || '').toLowerCase();
    const words = clean.split(/[^a-z0-9_\u0600-\u06FF]+/i).filter(Boolean);

    const deptVotes: Record<string, number> = {};
    const catVotes: Record<string, number> = {};
    const matchedKeywords: string[] = [];
    let urgencySum = 0;
    let urgencyCount = 0;
    let safetyRiskDetected = false;

    for (const [kw, meta] of Object.entries(CIVIC_SEMANTIC_WEIGHTS)) {
      if (clean.includes(kw) || words.includes(kw)) {
        matchedKeywords.push(kw);
        deptVotes[meta.dept] = (deptVotes[meta.dept] || 0) + meta.weight;
        catVotes[meta.cat] = (catVotes[meta.cat] || 0) + meta.weight;
        urgencySum += meta.urgency;
        urgencyCount++;
        if (meta.safetyRisk) safetyRiskDetected = true;
      }
    }

    // Default category if provided
    if (selectedCategory) {
      catVotes[selectedCategory] = (catVotes[selectedCategory] || 0) + 2.0;
    }

    let topDept = 'Works & Services Department';
    let maxDeptVote = 0;
    for (const [dept, vote] of Object.entries(deptVotes)) {
      if (vote > maxDeptVote) {
        maxDeptVote = vote;
        topDept = dept;
      }
    }

    let topCat = selectedCategory || 'road_damage';
    let maxCatVote = 0;
    for (const [cat, vote] of Object.entries(catVotes)) {
      if (vote > maxCatVote) {
        maxCatVote = vote;
        topCat = cat;
      }
    }

    const baseUrgency = urgencyCount > 0 ? Math.round(urgencySum / urgencyCount) : 50;
    const finalUrgency = Math.min(100, Math.max(20, baseUrgency + (safetyRiskDetected ? 15 : 0)));

    let priority: 'low' | 'medium' | 'high' | 'critical' = 'low';
    let slaHours = 72;

    if (finalUrgency >= 85 || safetyRiskDetected) {
      priority = 'critical';
      slaHours = 12;
    } else if (finalUrgency >= 70) {
      priority = 'high';
      slaHours = 24;
    } else if (finalUrgency >= 45) {
      priority = 'medium';
      slaHours = 48;
    }

    const confidence = Math.min(98, Math.max(45, Math.round(maxDeptVote * 18 + matchedKeywords.length * 8)));

    return {
      suggestedDepartment: topDept,
      suggestedCategory: topCat,
      urgencyScore: finalUrgency,
      priority,
      confidence,
      slaHours,
      identifiedKeywords: matchedKeywords,
      safetyRiskDetected
    };
  }
};
