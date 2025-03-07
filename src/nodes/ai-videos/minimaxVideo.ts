import axios from "axios";
import { WorkflowNode, NodeData } from "@/types";

export class MiniMaxVideoNode implements WorkflowNode {
  name = "MiniMaxVideo";
  private apiKey = process.env.MINIMAX_API_KEY;
  private baseUrl = "https://api.minimaxi.chat/v1/video_generation";

  async execute(input: NodeData): Promise<NodeData> {
    try {
      const payload: any = {
        model: "I2V-01-Director", // Mặc định dùng image-to-video, có thể đổi thành "T2V-01-Director" cho text-to-video
        prompt_optimizer: true,
      };
      if (input.content && !input.imageUrl) {
        payload.model = "T2V-01-Director";
        payload.prompt = input.content || "[Static shot]A default scene.";
      } else if (input.imageUrl) {
        // Image-to-video
        payload.model = "I2V-01-Director";
        payload.prompt =
          input.content ||
          "[Truck left,Pan right]A default scene with the image.";
        payload.first_frame_image = input.imageUrl;

        if (payload.first_frame_image.startsWith("data:image/")) {
        } else {
          if (
            /[^a-zA-Z0-9\-._~:/?#[\]@!$&'()*+,;=]/.test(
              payload.first_frame_image
            )
          ) {
            throw new Error(
              "Invalid image URL. Special characters (e.g., Chinese) are not allowed in MiniMax API."
            );
          }
          const imageResponse = await axios.head(payload.first_frame_image);
          const contentType = imageResponse.headers["content-type"];
          const contentLength = parseInt(
            imageResponse.headers["content-length"] || "0",
            10
          );

          if (!["image/jpeg", "image/png", "image/jpg"].includes(contentType)) {
            throw new Error("Unsupported image format. Use JPG, JPEG, or PNG.");
          }
          if (contentLength > 20 * 1024 * 1024) {
            throw new Error("Image size exceeds 20MB limit.");
          }
          const imageInfo = await axios.get(payload.first_frame_image, {
            responseType: "arraybuffer",
          });
          const aspectRatio = imageInfo.data.width / imageInfo.data.height;
          if (aspectRatio < 0.4 || aspectRatio > 2.5) {
            // 2:5 = 0.4, 5:2 = 2.5
            throw new Error("Image aspect ratio must be between 2:5 and 5:2.");
          }
          if (Math.min(imageInfo.data.width, imageInfo.data.height) < 300) {
            throw new Error("Image shorter side must exceed 300 pixels.");
          }
        }
      } else {
        throw new Error(
          "No text or image provided for MiniMax video generation."
        );
      }

      const response = await axios.post(this.baseUrl, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      const taskId = response.data.task_id;

      let videoUrl: string | null = null;
      let retryCount = 0;
      const maxRetries = 18;
      while (retryCount < maxRetries && !videoUrl) {
        const queryResponse = await axios.get(
          `https://api.minimaxi.chat/v1/query/video_generation?task_id=${taskId}`,
          {
            headers: {
              Authorization: `Bearer ${this.apiKey}`,
            },
          }
        );

        const status = queryResponse.data.status;
        if (status === "Success") {
          const fileId = queryResponse.data.file_id;
          const fileResponse = await axios.get(
            `https://api.minimaxi.chat/v1/files/retrieve?file_id=${fileId}`,
            {
              headers: {
                Authorization: `Bearer ${this.apiKey}`,
              },
            }
          );
          videoUrl = fileResponse.data.file.download_url;
          break;
        } else if (status === "Fail") {
          throw new Error("MiniMax video generation failed.");
        }

        retryCount++;
        await new Promise((resolve) => setTimeout(resolve, 10000));
      }

      if (!videoUrl) {
        throw new Error(
          "Timeout waiting for MiniMax video generation. Task may still be processing or failed."
        );
      }

      return {
        videoUrl,
        type: "video",
      };
    } catch (error: any) {
      if (error.response?.status === 429) {
        throw new Error(
          "MiniMax rate limit exceeded. Try again later (1 request/second, max 8 queued tasks)."
        );
      } else if (error.response?.status === 400) {
        throw new Error(
          `MiniMax API error: Invalid input - ${
            error.response.data.base_resp.status_msg || error.message
          }`
        );
      }
      throw new Error(`MiniMax API error: ${error.message}`);
    }
  }
}
