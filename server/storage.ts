import { db } from "./db";
import { axioms, tensions, revisions, type Axiom, type Tension, type Revision, type InsertAxiom, type InsertTension, type InsertRevision } from "@shared/schema";
import { eq, desc, sql } from "drizzle-orm";

export interface IStorage {
  // Axioms
  getAxioms(): Axiom[];
  getAxiom(id: number): Axiom | undefined;
  createAxiom(data: InsertAxiom): Axiom;
  updateAxiom(id: number, data: Partial<InsertAxiom>): Axiom | undefined;
  deleteAxiom(id: number): boolean;
  // Tensions
  getTensions(): Tension[];
  getTension(id: number): Tension | undefined;
  createTension(data: InsertTension): Tension;
  updateTension(id: number, data: Partial<InsertTension>): Tension | undefined;
  deleteTension(id: number): boolean;
  // Revisions
  getRevisions(): Revision[];
  getRevision(id: number): Revision | undefined;
  createRevision(data: InsertRevision): Revision;
  deleteRevision(id: number): boolean;
}

function now(): string {
  return new Date().toISOString();
}

function nextAxiomNumber(): number {
  const result = db.select({ max: sql<number>`max(${axioms.number})` }).from(axioms).get();
  return ((result?.max) ?? 0) + 1;
}

export class Storage implements IStorage {
  constructor() {
    this.seed();
  }

  // ─── Axioms ──────────────────────────────────────────────────────────────
  getAxioms(): Axiom[] {
    return db.select().from(axioms).orderBy(desc(axioms.confidenceScore)).all();
  }

  getAxiom(id: number): Axiom | undefined {
    return db.select().from(axioms).where(eq(axioms.id, id)).get();
  }

  createAxiom(data: InsertAxiom): Axiom {
    const ts = now();
    const number = nextAxiomNumber();
    return db.insert(axioms).values({
      ...data,
      number,
      createdAt: ts,
      updatedAt: ts,
    }).returning().get();
  }

  updateAxiom(id: number, data: Partial<InsertAxiom>): Axiom | undefined {
    return db.update(axioms)
      .set({ ...data, updatedAt: now() })
      .where(eq(axioms.id, id))
      .returning().get();
  }

  deleteAxiom(id: number): boolean {
    const result = db.delete(axioms).where(eq(axioms.id, id)).run();
    return result.changes > 0;
  }

  // ─── Tensions ────────────────────────────────────────────────────────────
  getTensions(): Tension[] {
    return db.select().from(tensions).orderBy(desc(tensions.createdAt)).all();
  }

  getTension(id: number): Tension | undefined {
    return db.select().from(tensions).where(eq(tensions.id, id)).get();
  }

  createTension(data: InsertTension): Tension {
    return db.insert(tensions).values({ ...data, createdAt: now() }).returning().get();
  }

  updateTension(id: number, data: Partial<InsertTension>): Tension | undefined {
    return db.update(tensions).set(data).where(eq(tensions.id, id)).returning().get();
  }

  deleteTension(id: number): boolean {
    const result = db.delete(tensions).where(eq(tensions.id, id)).run();
    return result.changes > 0;
  }

  // ─── Revisions ───────────────────────────────────────────────────────────
  getRevisions(): Revision[] {
    return db.select().from(revisions).orderBy(desc(revisions.date)).all();
  }

  getRevision(id: number): Revision | undefined {
    return db.select().from(revisions).where(eq(revisions.id, id)).get();
  }

  createRevision(data: InsertRevision): Revision {
    return db.insert(revisions).values({ ...data, createdAt: now() }).returning().get();
  }

  deleteRevision(id: number): boolean {
    const result = db.delete(revisions).where(eq(revisions.id, id)).run();
    return result.changes > 0;
  }

  // ─── Seed ─────────────────────────────────────────────────────────────────
  private seed() {
    const count = db.select({ c: sql<number>`count(*)` }).from(axioms).get();
    if (count && Number(count.c) > 0) return;

    const ts = now();

    // Seed axioms
    db.insert(axioms).values([
      {
        number: 1,
        title: "Visibility Is Less Dangerous Than Anticipation Suggests",
        liminalCount: 6,
        parallaxCount: 3,
        praxisCount: 4,
        inputDescriptions: JSON.stringify([
          "Liminal: recurring fear of judgment and exposure in public contexts",
          "Parallax: repeated pattern of concealment across multiple life domains",
          "Praxis: four exposure experiments yielding lower-than-expected backlash"
        ]),
        signal: "Liminal surfaces a persistent fear of being judged. Parallax maps a structural pattern of concealment. Praxis records multiple experiments where exposure produced fewer negative consequences than anticipated.",
        convergence: "Three independent sources converge on the same behavioral distortion: anticipated social risk is systematically inflated relative to actual outcomes.",
        interpretation: "The fear of social judgment appears exaggerated relative to real consequences. The internal model of social threat is running on outdated calibration.",
        truthClaim: "Visibility is often less costly than concealment imagines.",
        workingPrinciple: "Act toward visibility when concealment feels reflexive, not when it feels considered.",
        confidence: "medium-high",
        confidenceScore: 72,
        counterevidence: "Public exposure still produces destabilization when identity stakes are elevated or when the context involves genuine power asymmetry.",
        revisionNote: "Originally treated as a global fear of visibility; now understood as a context-dependent phenomenon related to identity stakes and perceived power.",
        revisionHistory: JSON.stringify([
          {
            date: "2024-09-12",
            change: "Upgraded from medium to medium-high confidence after two additional Praxis experiments confirmed the pattern across different social contexts.",
            previousConfidence: "medium"
          }
        ]),
        createdAt: "2024-07-15T00:00:00.000Z",
        updatedAt: "2024-09-12T00:00:00.000Z",
      },
      {
        number: 2,
        title: "Autonomy Is a Precondition for Sustained Creative Energy",
        liminalCount: 4,
        parallaxCount: 5,
        praxisCount: 6,
        inputDescriptions: JSON.stringify([
          "Liminal: questioning why structured environments produce creative resistance",
          "Parallax: consistent pattern of peak output correlating with self-directed conditions",
          "Praxis: six experiments comparing constrained vs. self-directed creative work"
        ]),
        signal: "Liminal questioning of creative resistance in structured contexts. Parallax reveals a consistent pattern: output quality and duration of flow correlate with degree of self-direction. Praxis experiments confirm this causally.",
        convergence: "All three sources point to autonomy — not skill or inspiration — as the variable that most reliably predicts creative endurance.",
        interpretation: "Creative energy is not a fixed resource depleted by work. It is sensitive to conditions of control. Autonomy restores the sense of intrinsic motivation that sustains creative work over time.",
        truthClaim: "Autonomy is a precondition for sustained creative energy, not a luxury or preference.",
        workingPrinciple: "Protect unstructured time as structural necessity, not optional reward.",
        confidence: "high",
        confidenceScore: 88,
        counterevidence: "Constraints imposed externally sometimes produce unexpected creative breakthroughs, particularly in early-stage ideation. The autonomy principle may be more relevant to execution than generation.",
        revisionNote: "Initially believed motivation was the primary driver. Evidence points to autonomy as the upstream cause of both motivation and output quality.",
        revisionHistory: JSON.stringify([
          {
            date: "2024-11-02",
            change: "Upgraded to high confidence after six Praxis experiments with controlled conditions. Shifted working principle from 'seek autonomy' to 'protect it structurally.'",
            previousConfidence: "medium-high"
          }
        ]),
        createdAt: "2024-08-03T00:00:00.000Z",
        updatedAt: "2024-11-02T00:00:00.000Z",
      },
      {
        number: 3,
        title: "Excess Structure Improves Short-Term Output but Erodes Deeper Motivation",
        liminalCount: 3,
        parallaxCount: 4,
        praxisCount: 5,
        inputDescriptions: JSON.stringify([
          "Liminal: recurring discomfort with highly scheduled periods despite higher productivity metrics",
          "Parallax: pattern of burnout following extended structured periods",
          "Praxis: comparative experiments on output quality across structured and unstructured phases"
        ]),
        signal: "Liminal reveals persistent discomfort during high-structure periods even when output is measurably higher. Parallax identifies a recurring burnout cycle following sustained constraint. Praxis shows output volume rises but quality and intrinsic satisfaction fall.",
        convergence: "The short-term and long-term effects of structure appear to run in opposite directions. Structure optimizes for output at the cost of the underlying motivation that produces it.",
        interpretation: "Structure is a performance-enhancing intervention with a depletion cost. It borrows from the motivational reserves it cannot replenish.",
        truthClaim: "Excess structure improves output in the short term but gradually erodes the intrinsic motivation that makes output worth producing.",
        workingPrinciple: "Use structure as a tool, not a lifestyle. Build in structural emptiness before it is needed.",
        confidence: "medium",
        confidenceScore: 55,
        counterevidence: "Some extended high-structure periods have not produced burnout when the work was sufficiently meaningful and self-directed within the constraints.",
        revisionNote: "Originally framed as a binary — structure or freedom. Now understood as a dosage problem. Some structure is generative; excess is erosive. The threshold is unknown and variable.",
        revisionHistory: JSON.stringify([]),
        createdAt: "2024-09-20T00:00:00.000Z",
        updatedAt: "2024-09-20T00:00:00.000Z",
      },
      {
        number: 4,
        title: "Solitude Restores Clarity but Prolonged Isolation Distorts Proportion",
        liminalCount: 5,
        parallaxCount: 3,
        praxisCount: 3,
        inputDescriptions: JSON.stringify([
          "Liminal: questioning whether social withdrawal is restorative or avoidant",
          "Parallax: recurring cycle of clarity gained in solitude followed by distorted perception in extended isolation",
          "Praxis: three experiments on decision quality in solitary vs. socially-embedded conditions"
        ]),
        signal: "Liminal questioning of solitude's function — restorative or avoidant. Parallax maps a recurring cycle where solitude produces clarity early and distortion later. Praxis confirms decision quality differences between solitary and embedded conditions.",
        convergence: "Solitude and isolation appear to be phases in a process, not equivalent states. The beneficial effect of solitude has a duration limit beyond which it becomes distorting.",
        interpretation: "Solitude removes noise and clarifies perception, but extended isolation removes the calibrating feedback that keeps perception accurate.",
        truthClaim: "Solitude restores clarity. Prolonged isolation distorts emotional proportion and magnifies minor problems.",
        workingPrinciple: "Use solitude deliberately, with defined duration. Monitor for the transition from clarity to distortion.",
        confidence: "medium-high",
        confidenceScore: 68,
        counterevidence: "Some individuals appear to sustain accurate perception through extended solitude, suggesting the distortion effect may be temperament-dependent.",
        revisionNote: "Previously assumed more solitude was always better. The distortion pattern was only identified after tracking emotional perception across extended isolation periods.",
        revisionHistory: JSON.stringify([]),
        createdAt: "2024-10-08T00:00:00.000Z",
        updatedAt: "2024-10-08T00:00:00.000Z",
      },
      {
        number: 5,
        title: "Recognition Matters but Seeking It Directly Weakens the Work",
        liminalCount: 4,
        parallaxCount: 4,
        praxisCount: 2,
        inputDescriptions: JSON.stringify([
          "Liminal: examining the desire for recognition and its legitimacy",
          "Parallax: pattern of work quality decreasing when recognition is the proximate goal",
          "Praxis: two comparative experiments producing work for internal vs. external audiences"
        ]),
        signal: "Liminal questioning of the recognition drive's legitimacy and its relationship to authentic motivation. Parallax identifies a consistent quality drop when recognition becomes the proximate rather than downstream goal. Praxis experiments confirm this directly.",
        convergence: "Recognition is a real need, but orienting work toward it changes the work's quality. The mechanism appears to be that external orientation displaces the intrinsic problem-solving attention that produces good work.",
        interpretation: "Recognition can be a legitimate consequence of good work. It becomes corrosive when it becomes the purpose of the work.",
        truthClaim: "Recognition matters, but seeking it directly weakens the quality of the work and, paradoxically, reduces the likelihood of earning genuine recognition.",
        workingPrinciple: "Produce work as if recognition were not a variable. Use recognition as a signal to verify but not to direct.",
        confidence: "medium-low",
        confidenceScore: 38,
        counterevidence: "Some recognition-oriented work produces high quality when the audience itself functions as a creative constraint or accountability structure. The effect is not universal.",
        revisionNote: "This principle has low confidence because the Praxis evidence is limited (only two experiments) and the counterevidence is substantial. Requires more systematic testing.",
        revisionHistory: JSON.stringify([]),
        createdAt: "2024-11-15T00:00:00.000Z",
        updatedAt: "2024-11-15T00:00:00.000Z",
      },
    ]).run();

    // Seed tensions
    db.insert(tensions).values([
      {
        poleA: "AUTONOMY",
        poleB: "BELONGING",
        description: "The need for unstructured self-direction, freedom from external expectation, and sovereignty over creative conditions is in sustained tension with the need for relational grounding, shared purpose, and the calibrating feedback of genuine community.",
        evidence: JSON.stringify([
          "Axiom #2 demonstrates that autonomy is structurally necessary for creative endurance",
          "Isolation experiments (Axiom #4) show that prolonged autonomy without relational calibration distorts proportion",
          "Recurring Liminal pattern: withdrawal is both restorative and socially erosive"
        ]),
        relatedAxiomIds: JSON.stringify([2, 4]),
        createdAt: "2024-08-20T00:00:00.000Z",
      },
      {
        poleA: "STRUCTURE",
        poleB: "FLOW",
        description: "Deliberate constraint and systematic organization improve output reliability and produce measurable results in the short term. Unstructured openness generates the conditions for deeper creative discovery and sustained intrinsic motivation. Neither appears sufficient alone.",
        evidence: JSON.stringify([
          "Axiom #3 establishes that excess structure erodes motivation despite improving output volume",
          "Praxis experiments show flow states emerge from unstructured conditions but are unreliable",
          "No stable resolution: both extremes produce failure modes"
        ]),
        relatedAxiomIds: JSON.stringify([2, 3]),
        createdAt: "2024-09-25T00:00:00.000Z",
      },
      {
        poleA: "VISIBILITY",
        poleB: "CONCEALMENT",
        description: "The impulse toward concealment feels protective and often rational, but the evidence suggests it systematically overstates the danger of exposure. Visibility produces actual consequences that are consistently lower than anticipated. Yet the pull toward concealment persists across contexts where it has been empirically disproven.",
        evidence: JSON.stringify([
          "Axiom #1 establishes that visibility costs are lower than anticipated",
          "Parallax pattern of concealment persists even after repeated disconfirmation",
          "Identity-stakes contexts appear to reinstate the fear even after calibration"
        ]),
        relatedAxiomIds: JSON.stringify([1]),
        createdAt: "2024-07-20T00:00:00.000Z",
      },
      {
        poleA: "RECOGNITION",
        poleB: "PURITY OF WORK",
        description: "The desire to be seen and acknowledged for one's work is legitimate and persistent. Orienting work toward that desire measurably weakens the work. The tension is unresolved: suppressing the recognition drive produces resentment; honoring it produces distortion.",
        evidence: JSON.stringify([
          "Axiom #5 establishes the quality-recognition inverse relationship with low confidence",
          "No successful synthesis has been found — attempts to integrate both orientations have produced inconsistent results",
          "Ongoing: this tension may be definitional rather than resolvable"
        ]),
        relatedAxiomIds: JSON.stringify([5]),
        createdAt: "2024-11-18T00:00:00.000Z",
      },
    ]).run();

    // Seed revisions
    db.insert(revisions).values([
      {
        date: "2024-09-12",
        previousBelief: "Visibility is uniformly dangerous and should be avoided as a default practice.",
        newBelief: "Visibility anxiety is context-dependent, not universal. The fear of exposure is calibrated to identity stakes rather than to actual social risk.",
        triggeringEvidence: "Four Praxis exposure experiments across different social contexts consistently produced lower-than-expected negative consequences. The pattern was strong enough to warrant a confidence upgrade for Axiom #1.",
        significance: "major",
        relatedAxiomId: 1,
        createdAt: "2024-09-12T00:00:00.000Z",
      },
      {
        date: "2024-11-02",
        previousBelief: "Motivation is the primary variable in creative endurance. If motivation is high, output will follow.",
        newBelief: "Autonomy is upstream of motivation. Motivation is downstream of autonomy, not its own independent driver. Protecting autonomy structurally is more reliable than cultivating motivation directly.",
        triggeringEvidence: "Six Praxis experiments comparing controlled and self-directed creative conditions showed autonomy predicting output endurance more reliably than reported motivation levels.",
        significance: "major",
        relatedAxiomId: 2,
        createdAt: "2024-11-02T00:00:00.000Z",
      },
      {
        date: "2024-10-08",
        previousBelief: "More solitude is generally better for clarity and creative work. Social engagement is a cost, not a resource.",
        newBelief: "Solitude has a productive duration limit. Beyond that limit, it stops clarifying and begins distorting. Social engagement provides calibrating feedback that prevents perceptual drift in isolation.",
        triggeringEvidence: "Three Praxis decision-quality experiments and a Parallax review of recurring emotional distortion patterns following extended isolation periods.",
        significance: "moderate",
        relatedAxiomId: 4,
        createdAt: "2024-10-08T00:00:00.000Z",
      },
      {
        date: "2024-09-25",
        previousBelief: "Structure is opposed to creativity. Productive creative work requires freedom from constraint.",
        newBelief: "Structure and creativity exist in a dosage relationship, not binary opposition. Some structure is generative. Excess structure depletes the motivational substrate of creative work. The threshold is variable and must be monitored, not assumed.",
        triggeringEvidence: "Comparative Praxis experiments examining output quality and intrinsic satisfaction across structured and unstructured phases. Burnout cycle identified by Parallax review.",
        significance: "moderate",
        relatedAxiomId: 3,
        createdAt: "2024-09-25T00:00:00.000Z",
      },
    ]).run();
  }
}

export const storage = new Storage();
