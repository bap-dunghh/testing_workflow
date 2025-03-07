import axios from "axios";
import { WorkflowNode, NodeData } from "@/types";

export class FluxNode implements WorkflowNode {
  name = "FluxTextToImage";
  private apiUrl = "https://api.fal.ai/v1/models/flux.1-dev/run"; // API Fal.ai
  private apiKey = process.env.FAL_API_KEY; // Đăng ký tại fal.ai để lấy key miễn phí

  async execute(input: NodeData): Promise<NodeData> {
    try {
      const prompt =
        input.content || "A vibrant marketing banner for a product launch";
      const response = await axios.post(
        this.apiUrl,
        {
          prompt: prompt,
          num_inference_steps: 28,
          guidance_scale: 7.5,
          image_size: "256x256",
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
        }
      );

      const taskId = response.data.task_id;
      let imageUrl: string | null = null;
      let retryCount = 0;
      const maxRetries = 20;

      while (retryCount < maxRetries && !imageUrl) {
        const statusResponse = await axios.get(
          `https://api.fal.ai/v1/tasks/${taskId}`,
          {
            headers: { Authorization: `Bearer ${this.apiKey}` },
          }
        );
        if (statusResponse.data.status === "completed") {
          imageUrl = statusResponse.data.output.images[0].url;
          break;
        } else if (statusResponse.data.status === "failed") {
          throw new Error("FLUX.1 image generation failed");
        }
        retryCount++;
        await new Promise((resolve) => setTimeout(resolve, 3000)); // Chờ 3 giây
      }

      if (!imageUrl) {
        throw new Error("Timeout waiting for FLUX.1 image generation");
      }

      return {
        ...input,
        imageUrl,
        type: "image",
      };
    } catch (error: any) {
      if (error.response?.status === 429) {
        throw new Error("FLUX.1 rate limit exceeded. Try again later.");
      }
      throw new Error(`FLUX.1 API error: ${error.message}`);
    }
  }
}
