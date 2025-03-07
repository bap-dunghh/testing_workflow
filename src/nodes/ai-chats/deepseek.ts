import axios from "axios";
import { WorkflowNode, NodeData } from "@/types";

export class DeepSeekNode implements WorkflowNode {
  name = "DeepSeek";
  private apiKey = process.env.DEEPSEEK_API_KEY;
  private baseUrl = "https://api.deepseek.com/chat/completions";
  async execute(input: NodeData): Promise<NodeData> {
    const response = await axios.post(
      this.baseUrl,
      {
        model: "deepseek-chat", // Hoặc "deepseek-reasoner" cho reasoning
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: input.text || "Hello!" },
        ],
        stream: false,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
      }
    );
    return { content: response.data.choices[0].message.content, type: "text" };
  }
}
