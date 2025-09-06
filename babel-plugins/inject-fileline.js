// babel-plugins/inject-fileline.js
module.exports = function ({ types: t }) {
  return {
    name: "inject-file-and-line",
    visitor: {
      CallExpression(path, state) {
        // Look for calls to logger methods (debug, info, warn, error)
        const callee = path.node.callee;
        
        // Check if this is a method call like logger.debug, logger.info, etc.
        if (
          t.isMemberExpression(callee) &&
          t.isIdentifier(callee.property) &&
          ['debug', 'info', 'warn', 'error'].includes(callee.property.name)
        ) {
          // Optionally only inject in dev builds
          const onlyDev = !!(state.opts && state.opts.devOnly);
          if (onlyDev && process.env.NODE_ENV === "production") return;

          // Get file path and line number from the call site
          const filename = state.file?.opts?.filename || "unknown";
          const loc = path.node.loc;
          const line = loc?.start?.line || null;

          // Insert file path and line number as the first two arguments
          const args = path.node.arguments;
          const filePathArg = t.stringLiteral(filename);
          const lineArg = line !== null ? t.numericLiteral(line) : t.nullLiteral();
          
          // Prepend the new arguments at the beginning
          path.node.arguments = [filePathArg, lineArg, ...args];
        }
      },
      
      Identifier(path, state) {
        const name = path.node.name;

        // Only transform the special magic names
        if (name !== "__FILE__" && name !== "__LINE__") return;

        // If the identifier is a binding (declared in scope) — skip it.
        if (path.scope.hasBinding(name)) return;

        // Optionally only inject in dev builds
        const onlyDev = !!(state.opts && state.opts.devOnly);
        if (onlyDev && process.env.NODE_ENV === "production") return;

        // Try to get file path from Babel state
        const filename = state.file?.opts?.filename || "unknown";

        // Determine the source location (line)
        const loc = path.node.loc || path.parentPath?.node?.loc || null;
        const line = loc?.start?.line || null;

        if (name === "__FILE__") {
          path.replaceWith(t.stringLiteral(filename));
          return;
        }

        if (name === "__LINE__") {
          if (line === null) {
            path.replaceWith(t.nullLiteral());
          } else {
            path.replaceWith(t.numericLiteral(line));
          }
        }
      }
    }
  };
};
