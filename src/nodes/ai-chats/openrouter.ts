import axios from "axios";
import { WorkflowNode, NodeData } from "@/types";

export const PROMPTS = {
  SEO_ARTICLE: {
    description: "Tạo bài viết SEO chuyên sâu",
    content:
      "Write a 100-300 characters SEO-optimized article about '{input}' with keyword research insights.",
  },
  MARKETING_BANNER: {
    description: "Tạo mô tả hình ảnh banner quảng cáo",
    content:
      "Describe a vibrant 50-80 characters marketing banner image for '{input}' with bold colors, a catchy headline, and a clear call-to-action to boost engagement.",
  },
  SEO_INFOGRAPHIC: {
    description: "Mô tả infographic tối ưu SEO",
    content:
      "Create a 50-80 characters description of an SEO-optimized infographic for '{input}', featuring keyword-rich text, data visuals, and a clean layout to drive traffic.",
  },
  PRODUCT_PROMO_VISUAL: {
    description: "Mô tả hình ảnh quảng bá sản phẩm",
    content:
      "Generate a 50-80 characters description of a product promo image for '{input}', showcasing key features, a sleek design, and branding elements to attract customers.",
  },
  SEO_META: {
    description: "Tạo meta description tối ưu SEO",
    content:
      "Craft a 80-160 character SEO-friendly meta description for '{input}' with a strong call-to-action.",
  },
  VIVID_IMAGE_DESC: {
    description: "Mô tả hình ảnh sinh động",
    content:
      "Generate a vivid, detailed 40-80 characters image description for '{input}' suitable for storytelling.",
  },
  CREATIVE_STORY: {
    description: "Viết truyện ngắn sáng tạo",
    content:
      "Compose a 100-300 characters creative short story about '{input}' with a twist ending.",
  },
  SOCIAL_CAMPAIGN: {
    description: "Tạo chiến dịch mạng xã hội",
    content:
      "Design a 160-280 character social media campaign for '{input}' with hashtags and engagement hooks.",
  },
  TECH_EXPLANATION: {
    description: "Giải thích kỹ thuật đơn giản",
    content:
      "Explain '{input}' in a 180-250 word beginner-friendly technical guide with real-world examples.",
  },
  BUSINESS_PLAN: {
    description: "Lập kế hoạch kinh doanh ngắn gọn",
    content:
      "Draft a 150-300 characters business plan summary for '{input}' including market analysis and goals.",
  },
  EMAIL_MARKETING: {
    description: "Viết email quảng cáo",
    content:
      "Write a 100-300 characters marketing email for '{input}' with a compelling subject line and CTA.",
  },
  EDUCATION_LESSON: {
    description: "Tạo bài giảng giáo dục",
    content:
      "Develop a 100-300 characters lesson plan on '{input}' for students with key takeaways and activities.",
  },
  PRODUCT_DESC: {
    description: "Mô tả sản phẩm hấp dẫn",
    content:
      "Create a 120-180 characters product description for '{input}' highlighting benefits and features.",
  },
  LEGAL_SUMMARY: {
    description: "Tóm tắt pháp lý ngắn gọn",
    content:
      "Summarize '{input}' in a 180-250 characters legal overview with key points and implications.",
  },
  RESEARCH_SUMMARY: {
    description: "Tóm tắt nghiên cứu",
    content:
      "Write a 150-300 characters summary of '{input}' based on hypothetical research findings.",
  },
  TRAVEL_GUIDE: {
    description: "Hướng dẫn du lịch ngắn",
    content:
      "Compose a 150-300 characters travel guide for '{input}' with top attractions and tips.",
  },
  HEALTH_ADVICE: {
    description: "Lời khuyên sức khỏe",
    content:
      "Provide a 180-250 characters health advice article on '{input}' with evidence-based tips.",
  },
};
export const LIST_MODES = {
  qwen: "qwen/qwen2.5-vl-72b-instruct:free",
  moonlight: "moonshotai/moonlight-16b-a3b-instruct:free",
  deephermes: "nousresearch/deephermes-3-llama-3-8b-preview:free",
  dolphin: "cognitivecomputations/dolphin3.0-r1-mistral-24b:free",
  gemini: "google/gemini-2.0-pro-exp-02-05:free",
  deepseek: "deepseek/deepseek-chat:free",
};

export const MODELS: {
  [key: string]: { name: string; description: string; context: number };
} = {
  [LIST_MODES.qwen]: {
    name: "Qwen2.5 VL 72B Instruct",
    description:
      "Powerful 72B model for text and vision tasks with 131K context",
    context: 131072,
  },
  [LIST_MODES.moonlight]: {
    name: "Moonlight 16B A3B Instruct",
    description: "Optimized MoE model for multi-task performance, 8K context",
    context: 8192,
  },
  [LIST_MODES.deephermes]: {
    name: "DeepHermes 3 Llama 3 8B Preview",
    description: "Unified reasoning and response model, 131K context",
    context: 131072,
  },
  [LIST_MODES.dolphin]: {
    name: "Dolphin 3.0 R1 Mistral 24B",
    description: "Reasoning-focused general-purpose model, 33K context",
    context: 32768,
  },
  [LIST_MODES.gemini]: {
    name: "Gemini 2.0 Pro Exp 02-05",
    description: "Advanced multimodal model with 2M context",
    context: 2000000,
  },
  [LIST_MODES.deepseek]: {
    name: "DeepSeek V3",
    description: "DeepSeek chatbot model for general conversations",
    context: 0,
  },
};
export class OpenRouterNode implements WorkflowNode {
  name = "OpenRouter";
  private apiKey = process.env.OPENROUTER_API_KEY;
  private baseUrl = "https://openrouter.ai/api/v1/chat/completions";

  private models = MODELS;

  constructor(
    private modelId: keyof typeof MODELS = LIST_MODES.qwen,
    private promptId: keyof typeof PROMPTS = "SEO_ARTICLE"
  ) {
    if (!this.models[modelId]) {
      throw new Error(`Model ${modelId} not supported in free tier`);
    }
    if (!PROMPTS[promptId]) {
      throw new Error(`Prompt ${promptId} not supported`);
    }
  }

  async execute(input: NodeData): Promise<NodeData> {
    try {
      const baseContent = input.originalContent || input.content || "random";
      const prompt = PROMPTS[this.promptId].content.replace(
        "{input}",
        baseContent
      );
      const response = await axios.post(
        this.baseUrl,
        {
          model: this.modelId,
          messages: [
            {
              role: "system",
              content:
                "You are an expert assistant. Provide accurate, concise, and professional responses based on the user's prompt.",
            },
            {
              role: "user",
              content: prompt,
            },
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
      return {
        ...input,
        content: response.data.choices[0].message.content,
        originalContent: baseContent,
        type: "text",
      };
    } catch (error: any) {
      if (error.response?.status === 402) {
        throw new Error(
          "OpenRouter free tier limit exceeded. Please add credits or check rate limits."
        );
      } else if (error.response?.status === 429) {
        throw new Error(
          "Rate limit exceeded. Wait 5 seconds and try again (OpenRouter free tier: 1 request/5s)."
        );
      }
      throw new Error(`OpenRouter API error: ${error.message}`);
    }
  }

  setModel(modelId: keyof typeof MODELS) {
    if (this.models[modelId]) {
      this.modelId = modelId;
    } else {
      throw new Error(`Model ${modelId} not supported`);
    }
  }
  setPrompt(promptId: keyof typeof PROMPTS) {
    if (PROMPTS[promptId]) {
      this.promptId = promptId;
    } else {
      throw new Error(`Prompt ${promptId} not supported`);
    }
  }
}
