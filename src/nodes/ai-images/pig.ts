import axios from "axios";
import { WorkflowNode, NodeData } from "@/types";

// Domain: https://imagepig.com/
// Docs: https://imagepig.com/docs/

export class ImagePigNode implements WorkflowNode {
  name = "Pig";
  private apiKey = process.env.IMAGE_PIC_API_KEY;
  private baseUrl = "https://api.imagepig.com";

  async execute(input: NodeData): Promise<NodeData> {
    try {
      const response = await axios.post(
        this.baseUrl,
        {
          prompt: input.content,
        },
        {
          headers: {
            "Content-Type": "application/json",
            'Api-Key': `${this.apiKey}`,
          },
        }
      );
      return {
        ...input,
        imageUrl: 'data:image/jpeg;base64,' + response.data?.image_data,
        type: "image",
      };
    } catch (error: any) {
      if (error.response?.status === 429) {
        throw new Error(
          "ImagePig free tier limit exceeded. Wait and try again."
        );
      }
      throw new Error(`Craiyon API error: ${error.message}`);
    }
  }
}
