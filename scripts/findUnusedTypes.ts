// scripts/findUnusedTypes.ts
import * as fs from 'fs';
import { Project } from 'ts-morph';

const project = new Project({ tsConfigFilePath: 'tsconfig.json' });
const checker = project.getTypeChecker();

// Get all source files
const sourceFiles = project.getSourceFiles().filter(file => 
  file.getFilePath().includes('/source/') && 
  !file.getFilePath().includes('node_modules')
);

console.log('🔍 Scanning for unused type definitions...\n');
console.log(`📂 Found ${sourceFiles.length} source files to analyze\n`);

let totalUnusedTypes = 0;
let totalInterfaces = 0;
let totalTypeAliases = 0;
let filesWithTypes = 0;

// Create output array
const output: string[] = [];

for (const file of sourceFiles) {
  const fileInterfaces = file.getInterfaces();
  const fileTypeAliases = file.getTypeAliases();
  
  if (fileInterfaces.length > 0 || fileTypeAliases.length > 0) {
    filesWithTypes++;
    console.log(`📁 ${file.getFilePath()}`);
    console.log(`   Interfaces: ${fileInterfaces.length}, Type Aliases: ${fileTypeAliases.length}`);
    
    // Check interfaces
    fileInterfaces.forEach(interfaceDecl => {
      const interfaceName = interfaceDecl.getName();
      totalInterfaces++;
      
      const allReferences = interfaceDecl.findReferencesAsNodes();
      const totalReferenceCount = allReferences.length;
      
      output.push(`\n🔍 Interface: ${interfaceName}`);
      output.push(`   File: ${file.getFilePath()}`);
      output.push(`   Total References: ${totalReferenceCount}`);
      
      if (totalReferenceCount === 0) {
        totalUnusedTypes++;
        output.push(`   ❌ UNUSED - No references found`);
      } else {
        output.push(`   ✅ Used in ${totalReferenceCount} place(s):`);
        allReferences.forEach(refNode => {
          output.push(`      - ${refNode.getSourceFile().getFilePath()} (line: ${refNode.getStartLineNumber()})`);
        });
      }
    });
    
    // Check type aliases
    fileTypeAliases.forEach(typeAlias => {
      const typeName = typeAlias.getName();
      totalTypeAliases++;
      
      const allReferences = typeAlias.findReferencesAsNodes();
      const totalReferenceCount = allReferences.length;
      
      output.push(`\n🔍 Type Alias: ${typeName}`);
      output.push(`   File: ${file.getFilePath()}`);
      output.push(`   Total References: ${totalReferenceCount}`);
      
      if (totalReferenceCount === 0) {
        totalUnusedTypes++;
        output.push(`   ❌ UNUSED - No references found`);
      } else {
        output.push(`   ✅ Used in ${totalReferenceCount} place(s):`);
        allReferences.forEach(refNode => {
          output.push(`      - ${refNode.getSourceFile().getFilePath()} (line: ${refNode.getStartLineNumber()})`);
        });
      }
    });
  }
}

// Write detailed report
fs.writeFileSync('type-usage-report.txt', output.join('\n'));

console.log(`\n📊 SUMMARY:`);
console.log(`   Files with types: ${filesWithTypes}`);
console.log(`   Total interfaces: ${totalInterfaces}`);
console.log(`   Total type aliases: ${totalTypeAliases}`);
console.log(`   Unused types: ${totalUnusedTypes}`);
console.log(`\n📄 Detailed report saved to: type-usage-report.txt`);

if (totalUnusedTypes > 0) {
  console.log(`\n❌ Found ${totalUnusedTypes} unused type definitions!`);
  process.exit(1);
} else {
  console.log(`\n✅ All types are being used externally!`);
}
