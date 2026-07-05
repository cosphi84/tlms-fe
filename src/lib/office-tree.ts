import { OfficeResponse } from "@/types/office-interface";

export interface OfficeTreeNode extends OfficeResponse {
  children: OfficeTreeNode[];
}

export function buildOfficeTree(offices: OfficeResponse[]): OfficeTreeNode[] {
  const map = new Map<number, OfficeTreeNode>();

  offices.forEach((office) => {
    map.set(office.id, {
      ...office,
      children: []
    });
  });

  const roots: OfficeTreeNode[] = [];

  map.forEach((office) => {
    if (!office.parent_id) {
      roots.push(office);
      return;
    }

    const parent = map.get(office.parent_id);

    if (parent) {
      parent.children.push(office);
    }
  });

  return roots;
}

export function filterTree(
  nodes: OfficeTreeNode[],
  keyword: string
): OfficeTreeNode[] {
  if (!keyword.trim()) {
    return nodes;
  }

  const search = keyword.toLowerCase();

  return nodes
    .map((node) => {
      const children = filterTree(node.children, keyword);

      const match =
        node.code.toLowerCase().includes(search) ||
        node.name.toLowerCase().includes(search);

      if (match || children.length > 0) {
        return {
          ...node,
          children
        };
      }

      return null;
    })
    .filter(Boolean) as OfficeTreeNode[];
}
