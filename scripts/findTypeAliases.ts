import * as path from 'path';
import * as ts from 'typescript';

function findTypeAliasesInDirectory(directoryPath: string, program: ts.Program, checker: ts.TypeChecker): Map<string, string[]> {
  const aliasedTypes = new Map<string, string[]>();

  for (const sourceFile of program.getSourceFiles()) {
    if (sourceFile.fileName.startsWith(directoryPath) && !sourceFile.isDeclarationFile && !sourceFile.fileName.includes('node_modules')) {
      ts.forEachChild(sourceFile, node => {
        let typeName: string | undefined;
        let canonicalTypeName: string | undefined;

        if (ts.isTypeAliasDeclaration(node)) {
          typeName = node.name.text;
          const aliasedType = checker.getTypeFromTypeNode(node.type);
          canonicalTypeName = checker.typeToString(aliasedType, node.type, ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.UseFullyQualifiedName);
        } else if (ts.isInterfaceDeclaration(node)) {
          typeName = node.name.text;
          const symbol = checker.getSymbolAtLocation(node.name);
          if (symbol) {
            const interfaceType = checker.getTypeOfSymbolAtLocation(symbol, node.name);
            canonicalTypeName = checker.typeToString(interfaceType, node.name, ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.UseFullyQualifiedName);
          }
        }

        if (typeName && canonicalTypeName) {
          if (!aliasedTypes.has(canonicalTypeName)) {
            aliasedTypes.set(canonicalTypeName, []);
          }
          aliasedTypes.get(canonicalTypeName)!.push(typeName);
        }
      });
    }
  }
  return aliasedTypes;
}

function findTypeAliasesByLayer(projectPath: string): void {
  const configPath = ts.findConfigFile(projectPath, ts.sys.fileExists, 'tsconfig.json');
  if (!configPath) {
    console.error('Could not find a valid tsconfig.json.');
    return;
  }

  const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
  const parsedCommandLine = ts.parseJsonConfigFileContent(
    configFile.config,
    ts.sys,
    path.dirname(configPath)
  );

  const layers = ['business', 'persistence', 'presentation', 'service'];
  const baseDir = path.join(projectPath, 'source');

  for (const layer of layers) {
    const layerInterfacesDir = path.join(baseDir, layer, 'interfaces');

    if (ts.sys.directoryExists(layerInterfacesDir)) {
      console.log(`
Checking layer: ${layer.toUpperCase()} - ${layerInterfacesDir}`);

      const filesInLayer = parsedCommandLine.fileNames.filter(fileName =>
        fileName.startsWith(layerInterfacesDir)
      );

      const program = ts.createProgram(filesInLayer, parsedCommandLine.options);
      const checker = program.getTypeChecker();

      const aliasedTypes = findTypeAliasesInDirectory(layerInterfacesDir, program, checker);

      let aliasGroupNumber = 1;
      for (const [canonicalType, aliases] of aliasedTypes.entries()) {
        if (aliases.length > 1) {
          console.log(`${aliasGroupNumber}) ${aliases.join(', / ')}`);
          aliasGroupNumber++;
        }
      }
    }
  }
}

const projectPath = process.cwd();
findTypeAliasesByLayer(projectPath);
