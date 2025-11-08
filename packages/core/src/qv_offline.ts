import { runRuleset, Claim, FileStub } from "./rules";

// Simplified contradiction and consensus logic for offline use
export function contradictionMap(claims: Claim[]) {
  const groups = new Map<string, Claim[]>();
  for (const c of claims) {
    const key = `${c.subject}::${c.predicate}`;
    (groups.get(key) ?? groups.set(key, []).get(key)!).push(c);
  }
  const results: any[] = [];
  groups.forEach((arr, key) => {
    const pairs: [Claim,Claim][] = [];
    for (let i=0;i<arr.length;i++) for (let j=i+1;j<arr.length;j++) {
      if (arr[i].object !== arr[j].object) pairs.push([arr[i],arr[j]]);
    }
    if (pairs.length) results.push({key, conflicts:pairs});
  });
  return results;
}

export interface LensOut { claims: Claim[]; role:"legal"|"risk"|"timeline"|"ethics"; ok:boolean; }

export function computeConsensus(lenses: LensOut[]) {
  const all = lenses.flatMap(l => l.claims);
  const conflicts = contradictionMap(all);
  const byKey = new Map<string, Claim[]>();
  for (const c of all) {
    const k = `${c.subject}::${c.predicate}::${c.object}`;
    (byKey.get(k) ?? byKey.set(k, []).get(k)!).push(c);
  }
  const clusters = [...byKey.values()].map(v => ({
    claim:v[0],
    votes:v.length,
    meanConf: v.reduce((a,b)=>a+b.confidence,0)/v.length
  }));
  const majority = clusters.filter(c => c.votes >= 3 && c.meanConf >= 0.70);
  const hardContradiction = conflicts.length>0;
  return {majority, conflicts, hardContradiction, score: majority.reduce((a,b)=>a+b.meanConf,0)/(majority.length||1)};
}


export function runOfflineQV(files: FileStub[]){
  const roles: Record<string, Claim[]> = {
    legal:       runRuleset("legal", files),
    risk:        runRuleset("behavioral", files), // maps to Risk-Scout in offline
    timeline:    runRuleset("timeline", files),
    ethics:      runRuleset("ethics", files),
    forensic:    runRuleset("forensic", files),
    financial:   runRuleset("financial", files)
  };
  const lenses = (["legal","risk","timeline","ethics"] as const).map(role => ({
    role, ok: true, claims: roles[role]
  }));
  const summary = computeConsensus(lenses);
  return { lenses, summary, extra: { forensic: roles.forensic, financial: roles.financial } };
}
