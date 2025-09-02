// scripts/findTypeClones.ts
import path from 'path';
import ts from 'typescript';

/* -------------------------------------------------- */
/* project + layers                                   */
/* -------------------------------------------------- */
const LAYERS = ['business', 'persistence', 'presentation', 'service'] as const;
type Layer = (typeof LAYERS)[number];

const SRC_DIR  = path.join(process.cwd(), 'source');
const CFG_PATH = ts.findConfigFile(SRC_DIR, ts.sys.fileExists, 'tsconfig.json');
if (!CFG_PATH) throw new Error('tsconfig.json not found');

const { config } = ts.readConfigFile(CFG_PATH, ts.sys.readFile);
const parsed     = ts.parseJsonConfigFileContent(config, ts.sys, path.dirname(CFG_PATH));
const program    = ts.createProgram(parsed.fileNames, parsed.options);
const checker    = program.getTypeChecker();
const files      = program.getSourceFiles();

/* layer → hash → [names] */
const buckets = new Map<Layer, Map<string, string[]>>();
LAYERS.forEach(l => buckets.set(l, new Map()));

/* -------------------------------------------------- */
/* helpers                                            */
/* -------------------------------------------------- */
function inferLayer(filePath: string): Layer | null {
  const m = filePath.match(/source\/(presentation|business|service|persistence)\/interfaces\//);
  return m ? (m[1] as Layer) : null;
}

function shapeSignature(type: ts.Type): string {
  return checker
    .getPropertiesOfType(type)
    .map(sym => {
      const decl   = sym.declarations?.[0];
      const pType  = checker.getTypeOfSymbolAtLocation(sym, decl ?? sym.valueDeclaration!);
      const text   = checker.typeToString(pType, undefined, ts.TypeFormatFlags.NoTruncation);
      const opt    = (sym.getFlags() & ts.SymbolFlags.Optional) ? '?' : '';
      return `${sym.getName()}:${text}${opt}`;
    })
    .sort()
    .join('|');
}

function record(layer: Layer, name: string, sig: string) {
  const layerMap = buckets.get(layer)!;
  layerMap.set(sig, (layerMap.get(sig) || []).concat(name));
}

/* -------------------------------------------------- */
/* walk files                                         */
/* -------------------------------------------------- */
for (const sf of files) {
  if (sf.isDeclarationFile) continue;
  const layer = inferLayer(sf.fileName);
  if (!layer) continue;

  sf.forEachChild(node => {
    if (ts.isInterfaceDeclaration(node)) {
      record(layer, node.name.text, shapeSignature(checker.getTypeAtLocation(node)));
    } else if (ts.isTypeAliasDeclaration(node)) {
      const aliasType = checker.getTypeFromTypeNode(node.type);
      /* consider only object-like aliases */
      if (aliasType.getProperties().length)
        record(layer, node.name.text, shapeSignature(aliasType));
    }
  });
}

/* -------------------------------------------------- */
/* report                                             */
/* -------------------------------------------------- */
for (const [layer, map] of buckets) {
  console.log(`\nChecking ${layer.toUpperCase()}`);
  let group = 1;
  for (const [, names] of map) {
    if (names.length > 1) {
      console.log(`${group++}) ${names.join(', ')}`);
    }
  }
}
