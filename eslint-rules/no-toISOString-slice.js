/**
 * ESLint rule to disallow patterns like:
 *   date.toISOString().split('T')[0]
 *   date.toISOString().slice(0, 10)
 *
 * This helps prevent accidental UTC-based date extraction. Suggest using
 * project utils (formatDateLocal / parseDateTimeLocal) instead.
 */

module.exports = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow extracting date part from toISOString() (use local format helpers)",
    },
    schema: [],
  },
  create(context) {
    return {
      CallExpression(node) {
        // detect .split(...) or .slice(...)
        const callee = node.callee;
        if (
          callee &&
          callee.type === "MemberExpression" &&
          callee.property &&
          (callee.property.name === "split" || callee.property.name === "slice")
        ) {
          const object = callee.object;
          // check object is a CallExpression ending with .toISOString()
          if (
            object &&
            object.type === "CallExpression" &&
            object.callee &&
            object.callee.type === "MemberExpression" &&
            object.callee.property &&
            object.callee.property.name === "toISOString"
          ) {
            context.report({
              node,
              message:
                "Avoid extracting date via toISOString().split/slice — use formatDateLocal/formatDateTimeLocal or parseDateTimeLocal before serializing.",
            });
          }
        }
      },
      MemberExpression(node) {
        // also detect pattern: toISOString().split('T')[0] where indexing occurs
        if (
          node.property &&
          node.property.type === "Literal" &&
          node.object &&
          node.object.type === "CallExpression" &&
          node.object.callee &&
          node.object.callee.type === "MemberExpression" &&
          node.object.callee.property &&
          node.object.callee.property.name === "split"
        ) {
          const inner = node.object.callee.object;
          if (
            inner &&
            inner.type === "CallExpression" &&
            inner.callee &&
            inner.callee.type === "MemberExpression" &&
            inner.callee.property &&
            inner.callee.property.name === "toISOString"
          ) {
            context.report({
              node,
              message:
                "Avoid extracting date via toISOString().split/slice — use formatDateLocal/formatDateTimeLocal or parseDateTimeLocal before serializing.",
            });
          }
        }
      },
    };
  },
};
