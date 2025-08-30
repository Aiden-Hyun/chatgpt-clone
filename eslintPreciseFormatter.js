// Custom ESLint formatter for Expo project
module.exports = function(results) {
    const lines = [];
    for (const file of results) {
      for (const msg of file.messages) {
        lines.push(
          `[${msg.ruleId}] ${file.filePath}:${msg.line}:${msg.column}-${msg.message}`
        );
      }
    }
    return lines.join("\n");
  };
  