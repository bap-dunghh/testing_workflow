import axios from "axios";
import { WorkflowNode, NodeData } from "@/types";

export class CraiyonNode implements WorkflowNode {
  name = "CraiyonTextToImage";
  private apiUrl = "https://api.craiyon.com/v1/generate";

  async execute(input: NodeData): Promise<NodeData> {
    try {
      const prompt = input.content || "A catchy SEO product advertisement";
      const response = await axios.post(
        this.apiUrl,
        { prompt },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const imageUrl = response.data.images[0]; // Lấy hình đầu tiên
      return {
        ...input,
        imageUrl,
        type: "image",
      };
    } catch (error: any) {
      if (error.response?.status === 429) {
        throw new Error("Craiyon rate limit exceeded. Try again later.");
      }
      throw new Error(`Craiyon API error: ${error.message}`);
    }
  }
}