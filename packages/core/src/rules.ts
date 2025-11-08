import legal from "../rules/legal.json";
import financial from "../rules/financial.json";
import behavioral from "../rules/behavioral.json";
import timeline from "../rules/timeline.json";
import forensic from "../rules/forensic.json";
import ethics from "../rules/ethics.json";

export type RulePack = typeof legal;

export const RULES: Record<string, RulePack> = {
  legal, financial, behavioral, timeline, forensic, ethics
};

export interface FileStub { name: string; ext: string; text: string; }
export interface Claim { subject:string; predicate:string; object:string; confidence:number; statute?:string; source:string; }

function matches(rule:any, f:FileStub){
  const { match } = rule;
  if (match.ext && !match.ext.includes(f.ext.toLowerCase())) return false;
  const t = f.text.toLowerCase();
  if (match.anyPhrases && !match.anyPhrases.some((p:string)=> t.includes(p.toLowerCase()))) return false;
  if (match.allPhrases && !match.allPhrases.every((p:string)=> t.includes(p.toLowerCase()))) return false;
  if (match.regex && !(new RegExp(match.regex, "i")).test(f.text)) return false;
  return true;
}

export function runRuleset(kind:keyof typeof RULES, files: FileStub[]): Claim[] {
  const pack = RULES[kind];
  const out: Claim[] = [];
  for (const f of files) {
    for (const r of pack.rules) {
      if (matches(r, f)) {
        out.push({ ...r.emit, source: f.name });
      }
    }
  }
  return out;
}
