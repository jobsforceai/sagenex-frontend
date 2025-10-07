// src/app/admin/users/[userId]/tree/client.tsx
'use client';

import { useMemo } from 'react';
import ReactFlow, {
  Controls,
  Background,
  Node,
  Edge,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { UserNode } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import dagre from 'dagre';

interface TreeClientProps {
  initialTreeData: UserNode;
}

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 200;
const nodeHeight = 80;

// Helper to transform the API data into a Dagre layout, then to React Flow nodes and edges
const transformDataToFlow = (userNode: UserNode) => {
  dagreGraph.setGraph({ rankdir: 'TB', nodesep: 20, ranksep: 80 });

  const nodes: Node[] = [];
  const edges: Edge[] = [];

  function traverse(node: UserNode, parentId: string | null) {
    const id = node.userId;

    dagreGraph.setNode(id, { width: nodeWidth, height: nodeHeight });

    if (parentId) {
      dagreGraph.setEdge(parentId, id);
    }

    if (node.children && node.children.length > 0) {
      node.children.forEach((child) => traverse(child, id));
    }
  }

  traverse(userNode, null);
  dagre.layout(dagreGraph);

  dagreGraph.nodes().forEach((nodeId) => {
    const node = dagreGraph.node(nodeId);
    const user = findUserNode(userNode, nodeId); // Find original user data
    if (user) {
      nodes.push({
        id: nodeId,
        position: { x: node.x - nodeWidth / 2, y: node.y - nodeHeight / 2 },
        data: {
          label: (
            <div className="p-2 text-left">
              <strong>{user.fullName}</strong>
              <br />
              <small>ID: {user.userId}</small>
              <br />
              <small>Package: ${user.packageUSD.toLocaleString()}</small>
            </div>
          ),
        },
        style: {
          border: '1px solid #777',
          padding: 10,
          borderRadius: 5,
          background: '#fff',
          width: nodeWidth,
        },
      });
    }
  });

  dagreGraph.edges().forEach((edge) => {
    edges.push({
      id: `${edge.v}-${edge.w}`,
      source: edge.v,
      target: edge.w,
      type: 'smoothstep',
      markerEnd: {
        type: MarkerType.ArrowClosed,
      },
    });
  });

  return { nodes, edges };
};

// Helper to find a user node in the tree by ID
function findUserNode(root: UserNode, userId: string): UserNode | null {
  if (root.userId === userId) {
    return root;
  }
  for (const child of root.children) {
    const found = findUserNode(child, userId);
    if (found) {
      return found;
    }
  }
  return null;
}

export function TreeClient({ initialTreeData }: TreeClientProps) {
  const { nodes, edges } = useMemo(
    () => transformDataToFlow(initialTreeData),
    [initialTreeData]
  );

  return (
    <Card>
      <CardContent className="pt-6">
        <div style={{ height: '70vh', width: '100%' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            fitView
            nodesDraggable={true}
            nodesConnectable={false}
          >
            <Controls />
            <Background />
          </ReactFlow>
        </div>
      </CardContent>
    </Card>
  );
}
