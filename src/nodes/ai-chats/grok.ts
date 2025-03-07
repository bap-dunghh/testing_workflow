import axios from "axios";
import { WorkflowNode, NodeData } from "@/types";

export class GrokNode implements WorkflowNode {
  name = "Grok";
  private apiKey = process.env.GROK_API_KEY;
  private baseUrl = "https://api.groq.com/openai/v1/chat/completions"; // Hoặc dùng OpenRouter nếu miễn phí

  async execute(input: NodeData): Promise<NodeData> {
    const response = await axios.post(
      this.baseUrl,
      {
        model: "grok-2", // Hoặc "grok-beta", tùy model bạn chọn
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: input.text || "Hello!" },
        ],
        stream: false,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`,
        },
      }
    );
    return { content: response.data.choices[0].message.content, type: "text" };
  }
}