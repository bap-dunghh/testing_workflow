export interface NodeData {
  text?: string;
  content?: string;
  imageUrl?: string;
  status?: string;
  keywork?: string;
  [key: string]: any;
}

export interface WorkflowNode {
  name: string;
  execute(input: NodeData): Promise<NodeData>;
}

export interface FlowElement {
  id: string;
  type: string;
  data: { label: string };
  position: { x: number; y: number };
}
