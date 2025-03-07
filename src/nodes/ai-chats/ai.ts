import axios from "axios";
import { WorkflowNode, NodeData } from "@/types";

export class AINode implements WorkflowNode {
  name = "AI";
  // private apiKey = process.env.OPENAI_API_KEY;
  private apiKey = 'sk-efgh5678abcd1234efgh5678abcd1234efgh5678'

  async execute(input: NodeData): Promise<NodeData> {
    console.log(this.apiKey)
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: input.text }],
      },
      { headers: { Authorization: `Bearer ${this.apiKey}` } }
    );
    return { content: response.data.choices[0].message.content, type: "text" };
  }
}