import { visit } from 'unist-util-visit';

// Maps :::type directive names to display labels.
// Matches the same set supported by preprocessCallouts() in src/lib/markdown.ts.
const CALLOUT_LABELS: Record<string, string> = {
  tip: '💡 Tip',
  warning: '⚠️ Warning',
  gotcha: '🚨 Gotcha',
};

/**
 * Remark plugin that converts remark-directive container directives
 * (:::tip / :::warning / :::gotcha) into HTML callout divs.
 *
 * Must run AFTER remark-directive in the plugin chain.
 */
export function remarkCallouts() {
  return (tree: any) => {
    visit(tree, 'containerDirective', (node: any) => {
      const type = (node.name as string).toLowerCase();
      const label = CALLOUT_LABELS[type];
      if (!label) return; // unknown directive — leave untouched

      node.data = {
        ...node.data,
        hName: 'div',
        hProperties: {
          ...(node.data?.hProperties ?? {}),
          class: `callout callout-${type}`,
        },
      };

      // Prepend the label span as the first child
      node.children.unshift({
        type: 'html',
        value: `<span class="callout-label">${label}</span>`,
      });
    });
  };
}
