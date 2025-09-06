/**
 * Format file path for display (extract relative path from absolute)
 */
export const formatFilePath = (filePath: string): string => {
  if (!filePath || filePath === "unknown") return "unknown";

  // If it's already relative, return as-is
  if (!filePath.startsWith("/")) {
    return filePath;
  }

  // Try multiple strategies to find the project root
  const possibleRoots = [
    // Strategy 1: Use process.cwd() if available
    (() => {
      try {
        return typeof process !== "undefined" && process.cwd
          ? process.cwd()
          : "";
      } catch {
        return "";
      }
    })(),

    // Strategy 2: Look for common project indicators in the path
    (() => {
      const parts = filePath.split("/");
      const srcIndex = parts.indexOf("src");
      if (srcIndex > 0) {
        return parts.slice(0, srcIndex).join("/");
      }
      return "";
    })(),

    // Strategy 3: Look for package.json or other project files
    (() => {
      const parts = filePath.split("/");
      for (let i = parts.length - 1; i >= 0; i--) {
        const testPath = parts.slice(0, i).join("/");
        // This is a heuristic - in a real app, you might check for actual files
        if (testPath.includes("chatgpt-clone") || testPath.includes("src")) {
          return testPath;
        }
      }
      return "";
    })(),
  ];

  // Try each strategy to find a matching root
  for (const projectRoot of possibleRoots) {
    if (projectRoot && filePath.startsWith(projectRoot)) {
      const relativePath = filePath.substring(projectRoot.length + 1);
      return relativePath;
    }
  }

  // If all strategies fail, try to extract just the src/ part
  const srcMatch = filePath.match(/.*\/(src\/.*)$/);
  if (srcMatch) {
    return srcMatch[1];
  }

  // Last resort: return the filename only
  const parts = filePath.split("/");
  return parts[parts.length - 1];
};

/**
 * Truncate file path if too long (keep filename visible)
 */
export const truncateFilePath = (
  filePath: string,
  maxWidth: number
): string => {
  if (filePath.length > maxWidth) {
    return "..." + filePath.substring(filePath.length - maxWidth + 3);
  }
  return filePath;
};
