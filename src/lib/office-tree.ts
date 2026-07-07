import { OfficeResponse } from "@/types/office-interface";

export interface OfficeTreeNode extends OfficeResponse {
  children: OfficeTreeNode[];
}

/**
 * Converts a flat list of offices (with lft/rgt nested set values) into a
 * parent→children tree. Uses parent_id.Int64 / parent_id.Valid to detect roots.
 */
export function buildOfficeTree(offices: OfficeResponse[]): OfficeTreeNode[] {
  const map = new Map<number, OfficeTreeNode>();

  offices.forEach((office) => {
    map.set(office.id, { ...office, children: [] });
  });

  const roots: OfficeTreeNode[] = [];

  map.forEach((office) => {
    // Root node: parent_id.Valid === false (Go sql.NullInt64)
    if (!office.parent_id?.Valid) {
      roots.push(office);
      return;
    }

    const parentId = office.parent_id.Int64;
    const parent = map.get(parentId);

    if (parent) {
      parent.children.push(office);
    } else {
      // Orphan — parent not in current page; treat as root
      roots.push(office);
    }
  });

  // Sort roots and their children by lft (nested-set order)
  const sortByLft = (nodes: OfficeTreeNode[]): OfficeTreeNode[] =>
    nodes
      .sort((a, b) => a.lft - b.lft)
      .map((n) => ({ ...n, children: sortByLft(n.children) }));

  return sortByLft(roots);
}

export function filterTree(
  nodes: OfficeTreeNode[],
  keyword: string
): OfficeTreeNode[] {
  if (!keyword.trim()) return nodes;

  const search = keyword.toLowerCase();

  return nodes
    .map((node) => {
      const children = filterTree(node.children, keyword);
      const match =
        node.code.toLowerCase().includes(search) ||
        node.name.toLowerCase().includes(search) ||
        node.type.toLowerCase().includes(search);

      if (match || children.length > 0) {
        return { ...node, children };
      }
      return null;
    })
    .filter(Boolean) as OfficeTreeNode[];
}
