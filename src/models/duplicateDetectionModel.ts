/**
 * Smart Civic Duplicate Detection Model
 * Open-Source Hybrid Embedding & Geospatial Distance Architecture
 * 
 * Computes:
 * 1. Subword 3-gram character frequency hashing into 128-dimensional dense vector space
 * 2. L2 normalized vector cosine similarity
 * 3. Geodesic Haversine spatial proximity
 * 4. Multi-modal match score (Text 55% + Category 25% + Geo 20%)
 */

import { calculateDistanceMeters } from '../lib/api';

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

const EMBEDDING_DIM = 128;

export const DuplicateDetectionModel = {
  /**
   * Generates a 128-dimensional subword and term-frequency dense vector for any text
   */
  generateSemanticEmbedding(text: string): CivicEmbedding {
    const vector = new Array(EMBEDDING_DIM).fill(0);
    const clean = (text || '').toLowerCase().trim();
    if (!clean) return { vector, norm: 0 };

    // Extract word tokens
    const words = clean.split(/[^a-z0-9_\u0600-\u06FF]+/i).filter(Boolean);

    for (const w of words) {
      let hash = 5381;
      for (let i = 0; i < w.length; i++) {
        hash = (hash * 33) ^ w.charCodeAt(i);
      }
      const idx = Math.abs(hash) % EMBEDDING_DIM;
      vector[idx] += 1.5;

      // Generate 3-grams for subword morphological matching
      if (w.length >= 3) {
        for (let i = 0; i <= w.length - 3; i++) {
          const tri = w.slice(i, i + 3);
          let triHash = 0;
          for (let j = 0; j < 3; j++) {
            triHash = (triHash << 5) - triHash + tri.charCodeAt(j);
          }
          const triIdx = Math.abs(triHash) % EMBEDDING_DIM;
          vector[triIdx] += 0.8;
        }
      }
    }

    // Compute Euclidean L2 Norm
    let sumSq = 0;
    for (let i = 0; i < EMBEDDING_DIM; i++) {
      sumSq += vector[i] * vector[i];
    }
    const norm = Math.sqrt(sumSq);

    // Normalize
    if (norm > 0) {
      for (let i = 0; i < EMBEDDING_DIM; i++) {
        vector[i] /= norm;
      }
    }

    return { vector, norm };
  },

  /**
   * Computes exact Cosine Similarity between two L2 normalized embeddings (0..1)
   */
  cosineSimilarity(e1: CivicEmbedding, e2: CivicEmbedding): number {
    if (e1.norm === 0 || e2.norm === 0) return 0;
    let dot = 0;
    for (let i = 0; i < EMBEDDING_DIM; i++) {
      dot += e1.vector[i] * e2.vector[i];
    }
    return Math.max(0, Math.min(1, dot));
  },

  /**
   * Finds potential duplicate complaints in existing tickets
   */
  findDuplicates(
    candidate: { text: string; category?: string; lat: number; lng: number },
    existingTickets: Array<{
      id: number;
      code: string;
      text: string;
      category: string;
      status: string;
      lat: number;
      lng: number;
    }>,
    options: {
      maxDistanceMeters?: number;
      minSimilarityThreshold?: number;
      maxResults?: number;
    } = {}
  ): DuplicateMatch[] {
    const maxDist = options.maxDistanceMeters ?? 450;
    const minThreshold = options.minSimilarityThreshold ?? 35;
    const maxResults = options.maxResults ?? 5;

    const candidateEmb = this.generateSemanticEmbedding(candidate.text);
    const matches: DuplicateMatch[] = [];

    for (const ticket of existingTickets) {
      if (ticket.status === 'closed' || ticket.status === 'resolved') continue;

      const ticketEmb = this.generateSemanticEmbedding(ticket.text);
      const cosineSim = this.cosineSimilarity(candidateEmb, ticketEmb);
      const semanticPct = Math.round(cosineSim * 100);

      const distM = calculateDistanceMeters(candidate.lat, candidate.lng, ticket.lat, ticket.lng);
      const isSameCategory = !candidate.category || candidate.category === ticket.category;

      let geoScore = 0;
      if (distM <= 50) geoScore = 100;
      else if (distM <= 150) geoScore = 80;
      else if (distM <= 300) geoScore = 55;
      else if (distM <= 500) geoScore = 30;

      // Hybrid calculation: Text 55% + Category 25% + Proximity 20%
      const hybridScore = Math.round(
        semanticPct * 0.55 +
        (isSameCategory ? 25 : 0) +
        (geoScore * 0.20)
      );

      const reasons: string[] = [];
      if (semanticPct >= 65) reasons.push(`${semanticPct}% semantic description match`);
      if (isSameCategory) reasons.push(`Identical civic category (${ticket.category})`);
      if (distM <= 100) reasons.push(`Close vicinity (${distM}m away)`);
      else if (distM <= 350) reasons.push(`Within immediate neighborhood (${distM}m)`);

      if (hybridScore >= minThreshold && distM <= maxDist) {
        let suggestedAction: 'merge_duplicate' | 'related_issue' | 'unique' = 'unique';
        if (hybridScore >= 68 || (semanticPct >= 75 && distM <= 150)) {
          suggestedAction = 'merge_duplicate';
        } else if (hybridScore >= 45) {
          suggestedAction = 'related_issue';
        }

        matches.push({
          ticketId: ticket.id,
          ticketCode: ticket.code,
          ticketText: ticket.text,
          category: ticket.category,
          status: ticket.status,
          similarityScore: hybridScore,
          semanticScore: semanticPct,
          distanceMeters: distM,
          isSameCategory,
          matchReasons: reasons,
          suggestedAction
        });
      }
    }

    return matches
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, maxResults);
  }
};
