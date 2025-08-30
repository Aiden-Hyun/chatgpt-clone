// eslintPreciseFormatter.js
/* Enhanced ESLint formatter with aligned columns, emojis, summary */
module.exports = function format(results) {
    /* -------- helper: map rule → emoji ------------------------------------ */
    function getRuleEmoji(ruleId) {
      const map = {
        // TypeScript basics
        '@typescript-eslint/no-unused-vars': '🫙',
        '@typescript-eslint/no-explicit-any': '🚫',
        '@typescript-eslint/naming-convention': '🏷️',
        '@typescript-eslint/array-type': '📋',
        '@typescript-eslint/no-empty-object-type': '📭',
  
        // Unused imports / vars
        'unused-imports/no-unused-imports': '📦',
        'unused-imports/no-unused-vars': '🗑️',
  
        // Import rules
        'import/order': '📚',
        'import/no-named-as-default': '🏷️',
        'import/no-duplicates': '🔄',
        'import/no-cycle': '🔄',
  
        // React
        'react-hooks/exhaustive-deps': '🎣',
        'react/no-unescaped-entities': '🔤',
        'react/jsx-key': '🔑',
  
        // General
        'no-restricted-syntax': '🚫',
        'no-console': '📺',
        'prefer-const': '🔒',
        'no-var': '🚫',
  
        // Fallback
        default: '⚙️',
      };
      return map[ruleId] || map.default;
    }
  
    /* -------- first pass: gather column widths --------------------------- */
    let maxRule = 0;
    let maxPath = 0;
    let maxLine = 0;
    let maxCol  = 0;
    let maxSev  = 0; // "ERROR" (5) vs "WARNING" (7)
  
    for (const file of results) {
      const rel = file.filePath.replace(process.cwd() + '/', '');
      maxPath = Math.max(maxPath, rel.length);
      for (const m of file.messages) {
        maxRule = Math.max(maxRule, m.ruleId.length);
        maxLine = Math.max(maxLine, String(m.line).length);
        maxCol  = Math.max(maxCol,  String(m.column).length);
        maxSev  = Math.max(maxSev,  m.severity === 2 ? 5 : 7);
      }
    }
  
    /* -------- alignment helpers ----------------------------------------- */
    const padL = (s, n) => s.toString().padStart(n, ' ');
    const padR = (s, n) => s.toString().padEnd(n, ' ');
  
    /* -------- main loop: build lines ------------------------------------ */
    const lines = [];
    let totalErrors = 0;
    let totalWarnings = 0;
    let filesWithIssues = 0;
    const ruleCounts = {};
    const startTime = Date.now();
  
    for (const file of results) {
      if (!file.messages.length) continue;
      filesWithIssues++;
  
      const rel = file.filePath.replace(process.cwd() + '/', '');
      for (const msg of file.messages) {
        const sevTxt   = msg.severity === 2 ? 'ERROR' : 'WARNING';
        const sevEmoji = msg.severity === 2 ? '🔴'   : '🟡';
        const ruleEm   = getRuleEmoji(msg.ruleId);
  
        ruleCounts[msg.ruleId] = (ruleCounts[msg.ruleId] || 0) + 1;
        if (msg.severity === 2) totalErrors++; else totalWarnings++;
  
        lines.push(
          `${sevEmoji}[${padR(sevTxt, maxSev)}] ` +
          `${ruleEm}[${padR(msg.ruleId, maxRule)}] ` +
          `🧭${padR(rel, maxPath)}:` +
          `${padL(msg.line, maxLine)}:` +
          `${padL(msg.column, maxCol)} – ` +
          `📩${msg.message}`
        );
      }
    }
  
    /* -------- summary block --------------------------------------------- */
    const totalIssues = totalErrors + totalWarnings;
    const durationMs  = Date.now() - startTime;
  
    if (totalIssues === 0) {
      return [
        '✅ No linting issues found!',
        `⏱️  Scan Duration: ${durationMs} ms`,
        `🔍 Files Scanned: ${results.length}`,
      ].join('\n');
    }
  
    const summary = [];
    summary.push('='.repeat(80));
    summary.push(`🔍 Files Scanned:      ${results.length}`);
    summary.push(`📁 Files with Issues:  ${filesWithIssues}`);
    summary.push(
      `📈 Total Issues:       ${totalIssues} (🔴${totalErrors} errors, 🟡${totalWarnings} warnings)`
    );
    summary.push(`⏱️  Scan Duration:     ${durationMs} ms`);
    summary.push('='.repeat(80), '');
  
    // top 5 rules
    const topRules = Object.entries(ruleCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
    if (topRules.length) {
      summary.push('🔥 TOP RULE VIOLATIONS:');
      summary.push('─'.repeat(40));
      topRules.forEach(([rule, count]) => {
        summary.push(`  ${getRuleEmoji(rule)} ${padR(rule, maxRule)} : ${count}×`);
      });
      summary.push('');
    }
  
    /* -------- output ----------------------------------------------------- */
    return summary.join('\n') + lines.join('\n');
  };
  