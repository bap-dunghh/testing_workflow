// @/nodes/ai-chats/huggingface.ts
import { HfInference } from "@huggingface/inference";
import { WorkflowNode, NodeData } from "@/types";

// Prompt cho Hugging Face
export const HF_PROMPTS = {
  TEXT_TO_IMAGE: {
    description: "Optinal...",
    content: "{input}",
  },
  DETAILED_IMAGE: {
    description: "Tạo ảnh chi tiết từ văn bản",
    content:
      "Create a detailed image of '{input}' with vibrant colors and clear elements.",
  },
  SIMPLE_SKETCH: {
    description: "Tạo bản phác thảo đơn giản",
    content: "Generate a simple sketch of '{input}' in black and white.",
  },
};

export const HF_LIST_MODES = {
  stableDiffusion2: "stabilityai/stable-diffusion-2-1",
  stableDiffusion15: "runwayml/stable-diffusion-v1-5",
  dalleMini: "dalle-mini/dalle-mini",
  flux1Schnell: "black-forest-labs/FLUX.1-schnell",
};

// Thông tin mô hình
export const HF_MODELS: {
  [key: string]: { name: string; description: string };
} = {
  [HF_LIST_MODES.stableDiffusion2]: {
    name: "Stable Diffusion 2.1",
    description: "Fast and free text-to-image model with normal quality",
  },
  [HF_LIST_MODES.stableDiffusion15]: {
    name: "Stable Diffusion 1.5",
    description: "Lightweight, fast model with good quality for general use",
  },
  [HF_LIST_MODES.dalleMini]: {
    name: "DALL-E Mini",
    description:
      "Super lightweight model for simple and quick image generation",
  },
  [HF_LIST_MODES.flux1Schnell]: {
    name: "FLUX.1-schnell",
    description: "Fast version of FLUX, free and optimized for speed",
  },
};

export class HuggingFaceNode implements WorkflowNode {
  name = "HuggingFace";
  private hfClient: HfInference;

  private models = HF_MODELS;

  constructor(
    private modelId: keyof typeof HF_MODELS = HF_LIST_MODES.stableDiffusion2,
    private promptId: keyof typeof HF_PROMPTS = "TEXT_TO_IMAGE"
  ) {
    if (!this.models[modelId]) {
      throw new Error(`Model ${modelId} not supported`);
    }
    if (!HF_PROMPTS[promptId]) {
      throw new Error(`Prompt ${promptId} not supported`);
    }
    this.hfClient = new HfInference(process.env.HF_API_KEY || "");
  }

  async execute(input: NodeData): Promise<NodeData> {
    try {
      const baseContent = input.originalContent || input.content || "random";
      const prompt = HF_PROMPTS[this.promptId].content.replace(
        "{input}",
        baseContent
      );

      const imageBlob = await this.hfClient.textToImage({
        model: this.modelId,
        inputs: prompt,
        // Các tham số tùy chọn (parameters) - chỉ comment để bạn tùy chỉnh khi cần
        // parameters: {
        num_inference_steps: 20, // Số bước suy luận, mặc định 50, giảm để nhanh hơn (2-10 cho tốc độ, 20-50 cho chất lượng)
        //   guidance_scale: 7, // Độ liên quan đến prompt, 1-20, cao hơn thì sát prompt hơn nhưng có thể bị artifacts
        //   negative_prompt: "low quality, blurry", // Những gì không muốn xuất hiện trong ảnh
        width: 256, // Chiều rộng ảnh (px), mặc định 512
        height: 256, // Chiều cao ảnh (px), mặc định 512
        //   seed: 42, // Seed cho tính ngẫu nhiên, cố định để kết quả lặp lại được
        //   scheduler: "DPMSolverMultistep", // Bộ lập lịch, tùy mô hình, ví dụ: "DPMSolverMultistep", "EulerDiscrete"
        // },
      });

      // Chuyển Blob thành base64
      const arrayBuffer = await imageBlob.arrayBuffer();
      const base64Image = Buffer.from(arrayBuffer).toString("base64");
      const imageUrl = `data:image/png;base64,${base64Image}`;

      return {
        ...input,
        imageUrl: imageUrl,
        type: "image",
      };
    } catch (error: any) {
      throw new Error(`HuggingFace API error: ${error.message}`);
    }
  }

  setModel(modelId: keyof typeof HF_MODELS) {
    if (this.models[modelId]) {
      this.modelId = modelId;
    } else {
      throw new Error(`Model ${modelId} not supported`);
    }
  }

  setPrompt(promptId: keyof typeof HF_PROMPTS) {
    if (HF_PROMPTS[promptId]) {
      this.promptId = promptId;
    } else {
      throw new Error(`Prompt ${promptId} not supported`);
    }
  }
}
