// scripts/findTypeClones.ts
import crypto from 'crypto';
import { Project, SourceFile, Type } from 'ts-morph';

/* Layers */
const LAYERS = ['presentation', 'business', 'service', 'persistence', 'database'] as const;
type Layer = (typeof LAYERS)[number];

/* 1️⃣  Load project */
const project = new Project({ tsConfigFilePath: 'tsconfig.json' });
const checker = project.getTypeChecker();

/* Map: layer → { shape-hash → [names] } */
const seen = new Map<Layer, Map<string, string[]>>();
LAYERS.forEach(l => seen.set(l, new Map()));

/* 2️⃣  Scan files */
for (const file of project.getSourceFiles()) {
  const layer = inferLayer(file);
  if (!layer) continue;

  file.getInterfaces().forEach(i => record(layer, i.getName(), i.getType()));
  file.getTypeAliases().forEach(t => record(layer, t.getName(), t.getType()));
}

/* ---------- helpers -------------------- */
function inferLayer(file: SourceFile): Layer | null {
  const m = file.getFilePath().match(/source\/(presentation|business|service|persistence|database)\//);
  return m ? (m[1] as Layer) : null;
}

function record(layer: Layer, name: string, type: Type) {
  const shape = type
    .getProperties()
    .map(sym => {
      const decl = sym.getValueDeclaration() ?? sym.getDeclarations()[0];
      const t    = sym.getTypeAtLocation(decl).getText(undefined, checker);
      return `${sym.getName()}:${t}`;
    })
    .sort()
    .join('|');

  const hash   = crypto.createHash('sha1').update(shape).digest('hex');
  const bucket = seen.get(layer)!;
  bucket.set(hash, (bucket.get(hash) || []).concat(name));
}

/* 3️⃣  Report duplicates within each layer */
for (const [layer, bucket] of seen) {
  for (const [, names] of bucket) {
    if (names.length > 1) {
      console.log(`🔁  Duplicate shape in ${layer}/interfaces:`, names.join(', '));
    }
  }
}
