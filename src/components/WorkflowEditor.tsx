// WorkflowEdittor.tsx
"use client";

import React, { useCallback, useRef, useState } from "react";
import ReactFlow, {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  Connection,
  Controls,
  Edge,
  EdgeChange,
  MiniMap,
  Node,
  NodeChange,
  ReactFlowProvider,
} from "reactflow";
import "reactflow/dist/style.css";

import { WorkflowNode } from "@/types";
import { Workflow } from "@/lib/workflow"; // Import Workflow từ lib
import ResultViewer from "./ResultViewer";
import { availableNodes, nodeTypes } from "@/nodes";
import { configApp } from "@/config";
import { MODELS, OpenRouterNode, PROMPTS } from "@/nodes/ai-chats/openrouter";
import {
  HF_MODELS,
  HF_PROMPTS,
  HuggingFaceNode,
} from "@/nodes/ai-images/hugging";

const WorkflowEditorContent: React.FC = () => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [input, setInput] = useState("");
  const [result, setResult] = useState<any>(null);
  const [results, setResults] = useState<any[]>([]);

  const nodeInstances = useRef<Map<string, WorkflowNode>>(new Map());

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes((nds) => applyNodeChanges(changes, nds));
  }, []);

  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    setEdges((eds) => applyEdgeChanges(changes, eds));
  }, []);

  const onConnect = useCallback((connection: Connection) => {
    setEdges((eds) => addEdge(connection, eds));
  }, []);

  const addNode = useCallback(
    (type: string, label: string, x: number, y: number) => {
      const id = `${Date.now()}`;
      const nodeDef = availableNodes.find(
        (n) => n.type === type && n.label === label
      );
      if (nodeDef) {
        const instance = new nodeDef.nodeClass();
        nodeInstances.current.set(id, instance);
        setNodes((nds) => [
          ...nds,
          {
            id,
            type,
            position: { x, y },
            data: {
              label,
              type,
              status: "",
              setPrompt: (
                promptId: keyof typeof PROMPTS | keyof typeof HF_PROMPTS
              ) => {
                if (instance instanceof OpenRouterNode) {
                  instance.setPrompt(promptId as keyof typeof PROMPTS);
                } else if (instance instanceof HuggingFaceNode) {
                  instance.setPrompt(promptId as keyof typeof HF_PROMPTS);
                }
              },
              setModel: (
                modelId: keyof typeof MODELS | keyof typeof HF_MODELS
              ) => {
                if (instance instanceof OpenRouterNode) {
                  instance.setModel(modelId as keyof typeof MODELS);
                } else if (instance instanceof HuggingFaceNode) {
                  instance.setModel(modelId as keyof typeof HF_MODELS);
                }
              },
              // setOutputType: (outputType: keyof typeof HF_OUTPUT_TYPES) => {
              //   if (instance instanceof HuggingFaceNode) {
              //     instance.setOutputType(outputType);
              //   }
              // },
            },
          },
        ]);
      }
    },
    []
  );

  const updateNodeStatus = (nodeId: string, status: string) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, status } } : node
      )
    );
  };

  const runWorkflow = async () => {
    setResults([]);
    setResult(null);

    const orderedNodes = getOrderedNodes(nodes, edges);
    if (!orderedNodes.length) {
      setResult({ error: "No valid workflow defined" });
      return;
    }

    const workflowClasses = orderedNodes
      .map((node) => nodeInstances.current.get(node.id))
      .filter((n) => n !== undefined) as WorkflowNode[];

    try {
      const workflow = new Workflow(workflowClasses);
      const initialInput = {
        content: input,
        type: "text",
        originalContent: input,
      };

      orderedNodes.forEach((node) => {
        updateNodeStatus(node.id, "pending");
      });

      const results = await workflow.run(
        initialInput,
        (index) => {
          updateNodeStatus(orderedNodes[index].id, "loading");
        },
        (index) => {
          updateNodeStatus(orderedNodes[index].id, "success");
        },
        (index) => {
          updateNodeStatus(orderedNodes[index].id, "failed");
        }
      );

      setResults(results);
      setResult(results[results.length - 1]);
    } catch (error) {
      setResult({ error: "Workflow failed" });
      setResults((rs) => [...rs, { error: "Workflow failed" }]);
    }
  };
  const getOrderedNodes = (nodes: Node[], edges: Edge[]): Node[] => {
    const visited = new Set<string>();
    const result: Node[] = [];

    const visit = (nodeId: string) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);

      const node = nodes.find((n) => n.id === nodeId);
      if (node) result.push(node);

      edges.filter((e) => e.source === nodeId).forEach((e) => visit(e.target));
    };

    const startNodes = nodes.filter(
      (n) => !edges.some((e) => e.target === n.id)
    );
    startNodes.forEach((n) => visit(n.id));

    return result;
  };

  const clearWorkflow = () => {
    setNodes([]);
    setEdges([]);
    setInput("");
    setResult(null);
    setResults([]);
    nodeInstances.current.clear();
  };

  return (
    <div style={{ height: "100vh", display: "flex" }}>
      <div
        style={{ width: 200, padding: 20, background: configApp.mainColor }}
        className="h-full pb-1 overflow-y-auto"
      >
        <div className="h-[calc(100vh_-_300px)] w-full overflow-y-auto">
          {availableNodes.map((node) => (
            <button
              key={node.type + node.label}
              className={`w-full ${
                ["telegramSend", "fanpageSend"].includes(node.type)
                  ? "bg-orange-600 hover:bg-orange-500 text-white"
                  : ["pig", "huggingface", "minimaxVideo"].includes(node.type)
                  ? "bg-yellow-500 hover:bg-yellow-400 text-gray-700"
                  : "bg-black hover:bg-gray-800 text-white"
              } rounded-lg p-2 cursor-pointer`}
              onClick={(e) =>
                addNode(
                  node.type,
                  node.label,
                  50,
                  50 * (availableNodes.indexOf(node) + 1)
                )
              }
              style={{ display: "block", margin: "5px 0" }}
            >
              {node.label}
            </button>
          ))}
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-2 w-[200px]">
          <div className="flex gap-2">
            <div className="bg-black h-5 w-5 text-sm" />
            <div className="w-[calc(100%_-_20px)]">Chat AI</div>
          </div>
          <div className="flex gap-2">
            <div className="bg-orange-600 h-5 w-5 text-sm" />
            <div className="w-[calc(100%_-_20px)]">
              Action - Chỉ nên đặt cuối cùng của flow
            </div>
          </div>
          <div className="flex gap-2">
            <div className="bg-yellow-500 h-5 w-5 text-sm" />
            <div className="w-[calc(100%_-_20px)]">AI gen media</div>
          </div>
          <hr className="my-2" />
          <div>
            Khi tạo node, có thể xóa đường line hay node bằng cách click vô
            element và bấm delete trên keyboard
          </div>
          <hr className="my-2" />
          <div>Version 0.0.1 - Beta</div>
        </div>
      </div>
      <div style={{ flex: 1 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>
      <div style={{ width: 300, padding: 20 }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Nhập yêu cầu..."
          style={{ width: "100%", marginBottom: 10 }}
          className="bg-gray-200 p-2 rounded-lg w-full text-black"
        />
        <button
          className="w-full bg-white rounded-lg text-black p-2 cursor-pointer hover:bg-gray-200"
          onClick={runWorkflow}
        >
          Run Workflow
        </button>
        <button
          className="w-full bg-white rounded-lg text-black p-2 cursor-pointer hover:bg-gray-200 mt-2 mb-2"
          onClick={clearWorkflow}
        >
          Clear Workflow
        </button>
        <div
          className="overflow-y-auto h-[calc(100%_-_140px)]"
          style={{
            overflowWrap: "anywhere",
          }}
        >
          {result && <ResultViewer result={result} />}
        </div>
      </div>
    </div>
  );
};

const WorkflowEditor: React.FC = () => {
  return (
    <ReactFlowProvider>
      <WorkflowEditorContent />
    </ReactFlowProvider>
  );
};

export default WorkflowEditor;
