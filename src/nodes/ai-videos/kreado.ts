import axios from "axios";
import { WorkflowNode, NodeData } from "@/types";

export class KreadoAiImageToVideoNode implements WorkflowNode {
  name = "KreadoAIImageToVideo";
  private apiKey = process.env.KREADOAI_API_KEY;
  private baseUrl = "https://api.kreadoai.com/apis/open";

  async execute(input: NodeData): Promise<NodeData> {
    try {
      // Bước 1: Upload hình ảnh (URL hoặc Base64) để tạo digital avatar
      let imageData: string;
      if (input.imageUrl && input.imageUrl.startsWith("data:image/")) {
        // Nếu là Base64, tách phần Base64 ra (bỏ phần "data:image/...;base64,")
        imageData = input.imageUrl.split(",")[1];
      } else if (input.imageUrl) {
        // Nếu là URL, dùng trực tiếp
        imageData = input.imageUrl;
      } else {
        throw new Error("No image URL or Base64 provided for KreadoAI video generation.");
      }

      // Upload hình ảnh qua endpoint /apis/open/avatar/v3/uploadAvatar
      const uploadResponse = await axios.post(
        `${this.baseUrl}/avatar/v3/uploadAvatar`,
        {
          fileUrl: imageData, // Gửi URL hoặc Base64 (phần Base64 đã tách)
        },
        {
          headers: {
            "Content-Type": "application/json",
            "apiToken": this.apiKey,
          },
        }
      );

      const jobId = uploadResponse.data.data.jobId;

      // Bước 2: Query kết quả upload để lấy digitalHumanId (endpoint /apis/open/avatar/v3/getUploadCustomAvatar)
      let digitalHumanId: number | null = null;
      let retryCount = 0;
      const maxRetries = 10; // Retry tối đa 10 lần để kiểm tra status
      while (retryCount < maxRetries && !digitalHumanId) {
        const queryResponse = await axios.post(
          `${this.baseUrl}/avatar/v3/getUploadCustomAvatar`,
          { jobId },
          {
            headers: {
              "Content-Type": "application/json",
              "apiToken": this.apiKey,
            },
          }
        );

        const status = queryResponse.data.data.status;
        if (status === 3) { // Success
          digitalHumanId = queryResponse.data.data.digitalHuman?.digitalHumanId;
          break;
        } else if (status === 4 || status === 5) { // Failure hoặc Timeout
          throw new Error("Failed to process image for KreadoAI video generation.");
        }

        retryCount++;
        await new Promise(resolve => setTimeout(resolve, 2000)); // Chờ 2 giây trước khi retry
      }

      if (!digitalHumanId) {
        throw new Error("Timeout waiting for image processing in KreadoAI.");
      }

      // Bước 3: Tạo video digital human từ digitalHumanId (endpoint /apis/open/video/v3/submitSystemLipTask)
      const videoResponse = await axios.post(
        `${this.baseUrl}/video/v3/submitSystemLipTask`,
        {
          taskName: "image-to-video-test",
          videoRatio: 1, // 16:9 aspect ratio, phù hợp video chất lượng thấp
          digitalHuman: { digitalHumanId },
          audio: {
            audioUrl: "https://aigc-cdn.kreadoai.com/digitalhuman/audio/2024/11/2b150387595c4efba35db553740cb47a.mp3", // Ví dụ audio, bạn có thể thay bằng audio động
          },
        },
        {
          headers: {
            "Content-Type": "application/json",
            "apiToken": this.apiKey,
          },
        }
      );

      const videoJobId = videoResponse.data.data.jobId;

      // Bước 4: Query kết quả video (endpoint /apis/open/video/v3/getLipVideoResult)
      let videoUrl: string | null = null;
      retryCount = 0;
      while (retryCount < maxRetries && !videoUrl) {
        const videoResultResponse = await axios.post(
          `${this.baseUrl}/video/v3/getLipVideoResult`,
          { jobId: videoJobId },
          {
            headers: {
              "Content-Type": "application/json",
              "apiToken": this.apiKey,
            },
          }
        );

        const videoStatus = videoResultResponse.data.data.status;
        if (videoStatus === 3) { // Success
          videoUrl = videoResultResponse.data.data.videoTask.videoUrl;
          break;
        } else if (videoStatus === 4 || videoStatus === 5) { // Failure hoặc Timeout
          throw new Error("Failed to generate video in KreadoAI.");
        }

        retryCount++;
        await new Promise(resolve => setTimeout(resolve, 5000)); // Chờ 5 giây trước khi retry
      }

      if (!videoUrl) {
        throw new Error("Timeout waiting for video generation in KreadoAI.");
      }

      return {
        videoUrl,
        type: "video",
      };
    } catch (error: any) {
      if (error.response?.status === 429) {
        throw new Error("KreadoAI rate limit exceeded. Try again later or check membership.");
      } else if (error.response?.status === 400) {
        throw new Error(`KreadoAI API error: Invalid input - ${error.response.data.message || error.message}`);
      } else if (error.response?.status === 10010) {
        throw new Error("KreadoAI face check failed. Ensure the image is a clear, unobstructed front-facing photo.");
      } else if (error.response?.status === 10007) {
        throw new Error("KreadoAI file size too large. Ensure image is under 10MB.");
      }
      throw new Error(`KreadoAI API error: ${error.message}`);
    }
  }
}