import { WorkflowNode, NodeData } from "@/types";
const dataTest = [
  "2025-03-04/SZEpyQorQTattte-t8P-lQ.webp",
  "2025-03-04/5s5_cQDPQKevKwjeB25hYA.webp",
];

export class TestNode implements WorkflowNode {
  name = "BoxTest2";

  async execute(input: NodeData): Promise<NodeData> {
    const content = input.content || "default content";
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          ...input,
          // imageUrls: dataTest.map(
          //   (src: string) => "https://img.craiyon.com/" + src
          // ),
          imageUrl: "https://img.craiyon.com/2025-03-04/SZEpyQorQTattte-t8P-lQ.webp",
          content,
          type: "images",
        });
      }, 1000);
    });
  }
}
