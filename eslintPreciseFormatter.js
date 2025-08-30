// Enhanced ESLint formatter for Expo project with metadata and grep-friendly output
module.exports = function(results) {
  // Helper function to get emoji for different rule types
  function getRuleEmoji(ruleId) {
    const ruleEmojis = {
      // TypeScript rules
      '@typescript-eslint/no-unused-vars': '🫙',
      '@typescript-eslint/no-explicit-any': '🚫',
      '@typescript-eslint/naming-convention': '🏷️',
      '@typescript-eslint/array-type': '📋',
      '@typescript-eslint/no-empty-object-type': '📭',
      
      // Unused imports/variables
      'unused-imports/no-unused-imports': '📦',
      'unused-imports/no-unused-vars': '🗑️',
      
      // Import rules
      'import/order': '📚',
      'import/no-named-as-default': '🏷️',
      'import/no-duplicates': '🔄',
      'import/no-cycle': '🔄',
      
      // React rules
      'react-hooks/exhaustive-deps': '🎣',
      'react/no-unescaped-entities': '🔤',
      'react/jsx-key': '🔑',
      
      // General rules
      'no-restricted-syntax': '🚫',
      'no-console': '📺',
      'prefer-const': '🔒',
      'no-var': '🚫',
      
      // Default emoji for unknown rules
      'default': '⚙️'
    };
    
    return ruleEmojis[ruleId] || ruleEmojis['default'];
  }
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
        
        // Grep-friendly format with emojis: 🔴[ERROR] 🫙[RULE] 🧭file:line:col - 📩message
        const severityEmoji = msg.severity === 2 ? '🔴' : '🟡';
        const ruleEmoji = getRuleEmoji(msg.ruleId);
        const fileEmoji = '🧭';
        const messageEmoji = '📩';
        
        lines.push(
          `${severityEmoji}[${severity}] ${ruleEmoji}[${msg.ruleId}] ${fileEmoji}${relativePath}:${lineNum}:${colNum} - ${messageEmoji}${msg.message}`
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
      `📈 Total Issues: ${totalIssues} (🔴${totalErrors} errors, 🟡${totalWarnings} warnings)`,
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
        const ruleEmoji = getRuleEmoji(rule);
        summaryLines.push(`  ${ruleEmoji} ${rule}: ${count} occurrences`);
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
  