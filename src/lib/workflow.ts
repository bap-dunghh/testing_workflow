import { WorkflowNode, NodeData } from "../types";

// export class Workflow {
//   constructor(private nodes: WorkflowNode[], private setResults: (cb: (prev: NodeData[]) => NodeData[]) => void) {}

//   async run(input: NodeData): Promise<NodeData> {
//     let data = input;

//     for (const node of this.nodes) {
//       data = await node.execute(data);
//       this.setResults((prev) => [...prev, data]); // Cập nhật results từng bước
//     }

//     return data;
//   }
// }

export class Workflow {
  constructor(private nodes: WorkflowNode[]) {}

  async run(
    input: NodeData,
    onNodeStarted?: (index: number) => void,
    onNodeExecuted?: (index: number, result: NodeData) => void,
    onNodeError?: (index: number, error: Error) => void
  ): Promise<NodeData[]> {
    let data = input;
    const results: NodeData[] = [];

    for (let i = 0; i < this.nodes.length; i++) {
      if (onNodeStarted) onNodeStarted(i);
      try {
        data = await this.nodes[i].execute(data);
        results.push(data);
        if (onNodeExecuted) onNodeExecuted(i, data);
      } catch (error) {
        if (onNodeError) onNodeError(i, error as Error);
        throw error; 
      }
    }

    return results;
  }
}
