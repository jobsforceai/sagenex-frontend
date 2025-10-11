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
import { UserNode, ParentNode } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import dagre from 'dagre';
import Image from 'next/image';

interface TreeClientProps {
  initialTreeData: UserNode;
  parentData: ParentNode | null;
}

const nodeWidth = 200;
const nodeHeight = 80;

// Helper to transform the API data into a Dagre layout, then to React Flow nodes and edges
const transformDataToFlow = (tree: UserNode, parent: ParentNode | null) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: 'TB', nodesep: 20, ranksep: 80 });

  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // Add parent node to the graph if it exists
  if (parent) {
    dagreGraph.setNode(parent.userId, { width: nodeWidth, height: nodeHeight });
    dagreGraph.setEdge(parent.userId, tree.userId);
  }

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

  traverse(tree, null);
  dagre.layout(dagreGraph);

  // Add parent node to the React Flow nodes array
  if (parent) {
    const parentGraphNode = dagreGraph.node(parent.userId);
    nodes.push({
      id: parent.userId,
      position: { x: parentGraphNode.x - nodeWidth / 2, y: parentGraphNode.y - nodeHeight / 2 },
      data: {
        label:
          parent.userId === 'SAGENEX-GOLD' ? (
            <div className="flex items-center justify-start gap-3 w-full">
              <Image src="/logo.png" alt="Sagenex Logo" width={60} height={60} className="object-contain h-20 w-20 rounded-md" />
              <div>
                <strong className="text-base">SAGENEX</strong>
                <br />
                <small className="text-muted-foreground">(Parent)</small>
              </div>
            </div>
          ) : (
            <div className="text-left">
              <strong>{parent.fullName}</strong>
              <br />
              <small>ID: {parent.userId}</small>
              <br />
              <small className="text-muted-foreground">(Parent)</small>
            </div>
          ),
      },
      style: {
        border: parent.userId === 'SAGENEX-GOLD' ? '2px solid #ca8a04' : '1px dashed #ccc',
        padding: 10,
        borderRadius: 8,
        background: parent.userId === 'SAGENEX-GOLD' ? '#fefce8' : '#fafafa',
        width: nodeWidth,
      },
    });
  }

  dagreGraph.nodes().forEach((nodeId) => {
    if (parent && nodeId === parent.userId) return; // Skip parent, already added

    const node = dagreGraph.node(nodeId);
    const user = findUserNode(tree, nodeId); // Find original user data
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
              {user.isSplitSponsor && (
                <>
                  <br />
                  <small className="text-blue-600 font-semibold">
                    Sponsor: {user.originalSponsorId}
                  </small>
                </>
              )}
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
  // Check if the root itself is the one we're looking for
  const queue: UserNode[] = [root];
  while(queue.length > 0) {
    const node = queue.shift();
    if(node && node.userId === userId) {
      return node;
    }
    if(node && node.children) {
      for(const child of node.children) {
        queue.push(child);
      }
    }
  }
  return null;
}


export function TreeClient({ initialTreeData, parentData }: TreeClientProps) {
  const { nodes, edges } = useMemo(
    () => transformDataToFlow(initialTreeData, parentData),
    [initialTreeData, parentData]
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
