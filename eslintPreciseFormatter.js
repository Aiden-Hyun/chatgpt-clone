// Enhanced ESLint formatter for Expo project with metadata and grep-friendly output
module.exports = function(results) {
  const lines = [];
  let totalErrors = 0;
  let totalWarnings = 0;
  let filesWithIssues = 0;
  const ruleCounts = {};
  const startTime = Date.now();
  
  // Process each file
  for (const file of results) {
    if (file.messages.length > 0) {
      filesWithIssues++;
      
      // Get relative path for cleaner output
      const relativePath = file.filePath.replace(process.cwd() + '/', '');
      
      // Process each message in the file
      for (const msg of file.messages) {
        const severity = msg.severity === 2 ? 'ERROR' : 'WARNING';
        const lineNum = msg.line.toString().padStart(4, ' ');
        const colNum = msg.column.toString().padStart(3, ' ');
        
        // Count rule occurrences
        ruleCounts[msg.ruleId] = (ruleCounts[msg.ruleId] || 0) + 1;
        
        // Grep-friendly format: [SEVERITY] [RULE] file:line:col - message
        lines.push(
          `[${severity}] [${msg.ruleId}] ${relativePath}:${lineNum}:${colNum} - ${msg.message}`
        );
        
        // Count by severity
        if (msg.severity === 2) {
          totalErrors++;
        } else {
          totalWarnings++;
        }
      }
    }
  }
  
  // Add summary metadata
  const totalIssues = totalErrors + totalWarnings;
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  if (totalIssues > 0) {
    // Add summary at the beginning
    const summaryLines = [
      '='.repeat(80),
      `🔍 Files Scanned: ${results.length}`,
      `📁 Files with Issues: ${filesWithIssues}`,
      `📈 Total Issues: ${totalIssues} (${totalErrors} errors, ${totalWarnings} warnings)`,
      `⏱️  Scan Duration: ${duration}ms`,
      '='.repeat(80),
      ''
    ];
    
    // Add top rule violations
    const topRules = Object.entries(ruleCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
    
    if (topRules.length > 0) {
      summaryLines.push('🔥 TOP RULE VIOLATIONS:');
      summaryLines.push('─'.repeat(40));
      topRules.forEach(([rule, count]) => {
        summaryLines.push(`  ${rule}: ${count} occurrences`);
      });
      summaryLines.push('');
    }
    
    // Combine summary and error lines
    return summaryLines.join('\n') + lines.join('\n');
  } else {
    return [
      '✅ No linting issues found!',
      `⏱️  Scan Duration: ${duration}ms`,
      `🔍 Files Scanned: ${results.length}`
    ].join('\n');
  }
};
  