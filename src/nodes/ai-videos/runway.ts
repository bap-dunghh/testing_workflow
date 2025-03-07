import axios from "axios";
import { WorkflowNode, NodeData } from "@/types";

export class RunwayVideoNode implements WorkflowNode {
  name = "RunwayVideo";
  private apiKey = process.env.RUNWAY_API_KEY;
  private baseUrl = "https://api.runwayml.com/v1/video"; // Giả định endpoint, cần kiểm tra API chính xác

  async execute(input: NodeData): Promise<NodeData> {
    try {
      const response = await axios.post(
        this.baseUrl,
        {
          prompt: input.text || "Xe cộ chạy trên đường, phong cách hoạt hình",
          duration: 10, // Free tier giới hạn 10-16 giây, dùng Gen-2
          model: "gen-2", // Sử dụng Gen-2 cho free plan, không dùng Gen-3 Alpha
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${this.apiKey}`,
          },
        }
      );
      return {
        videoUrl: response.data.video_url, // Giả định API trả về URL video
        type: "video",
      };
    } catch (error: any) {
      if (error.response?.status === 429) {
        throw new Error("Runway free tier credit limit (125 credits) exceeded. Check quota or wait.");
      }
      throw new Error(`Runway API error: ${error.message}`);
    }
  }
}