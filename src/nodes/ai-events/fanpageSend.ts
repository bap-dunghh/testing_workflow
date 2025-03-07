import axios from "axios";
import { WorkflowNode, NodeData } from "@/types";
import FormData from "form-data";

export class FanpageSendNode implements WorkflowNode {
  name = "FanpageSend";
  private pageToken: string;
  private pageId: string;
  private baseUrl = "https://graph.facebook.com/v20.0";

  constructor(pageId?: string, pageToken?: string) {
    this.pageId = pageId || process.env.FACEBOOK_PAGE_ID || "";
    this.pageToken = pageToken || process.env.FACEBOOK_PAGE_TOKEN || "";
    if (!this.pageId || !this.pageToken) {
      throw new Error("FanpageSendNode requires pageId and pageToken");
    }
  }

  // Hàm gửi một ảnh base64, hỗ trợ tùy chọn published
  private async sendBase64Image(
    base64Data: string,
    published: boolean = true,
    caption?: string
  ): Promise<any> {
    try {
      const base64String = base64Data.split(",")[1];
      const buffer = Buffer.from(base64String, "base64");

      const formData = new FormData();
      formData.append("access_token", this.pageToken);
      const blob = new Blob([buffer], { type: "image/png" });
      formData.append("source", blob, "image.png");
      formData.append("published", published.toString());
      if (caption && published) {
        formData.append("caption", caption);
      }

      const response = await axios.post(
        `${this.baseUrl}/${this.pageId}/photos`,
        formData
      );

      return response.data;
    } catch (error: any) {
      throw new Error(
        `Failed to send base64 image: ${
          error.response?.data?.error?.message || error.message
        }`
      );
    }
  }

  // Hàm gửi nhiều ảnh (base64 hoặc URL)
  private async sendMultiplePhotos(
    imageUrls: string[],
    caption?: string
  ): Promise<any> {
    try {
      // Upload tất cả ảnh đồng thời để lấy ID
      const uploadPromises = imageUrls.map(async (imageUrl) => {
        if (imageUrl.startsWith("data:image/")) {
          return this.sendBase64Image(imageUrl, false); // Không đăng ngay
        } else {
          const response = await axios.post(
            `${this.baseUrl}/${this.pageId}/photos`,
            {
              url: imageUrl,
              published: false, // Chỉ upload để lấy ID
              access_token: this.pageToken,
            }
          );
          return response.data;
        }
      });

      const photoResults = await Promise.all(uploadPromises);
      const photoIds = photoResults.map((result) => result.id);

      // Tạo bài đăng với nhiều ảnh
      const response = await axios.post(`${this.baseUrl}/${this.pageId}/feed`, {
        message: caption || undefined,
        attached_media: photoIds.map((id) => ({ media_fbid: id })),
        access_token: this.pageToken,
      });

      return response.data;
    } catch (error: any) {
      throw new Error(
        `Failed to send multiple photos: ${
          error.response?.data?.error?.message || error.message
        }`
      );
    }
  }

  async execute(input: NodeData): Promise<NodeData> {
    const content = input.content || "";
    const imageUrl = input.imageUrl as string | undefined;
    const imageUrls = (input.imageUrls as string[]) || [];

    try {
      let response;
      if (imageUrls.length > 0) {
        response = await this.sendMultiplePhotos(imageUrls, content);
      } else if (imageUrl) {
        if (imageUrl.startsWith("data:image/")) {
          response = await this.sendBase64Image(imageUrl, true, content);
        } else {
          response = await axios.post(`${this.baseUrl}/${this.pageId}/photos`, {
            url: imageUrl,
            caption: content || undefined,
            access_token: this.pageToken,
          });
        }
      } else if (content) {
        response = await axios.post(`${this.baseUrl}/${this.pageId}/feed`, {
          message: content,
          access_token: this.pageToken,
        });
      } else {
        throw new Error("No content or image provided");
      }

      return {
        content: `Posted: https://facebook.com/${response.id}`,
        type: "text",
        status: "success",
      };
    } catch (error: any) {
      console.error(error);
      throw new Error(
        `Facebook API error: ${
          error.response?.data?.error?.message || error.message
        }`
      );
    }
  }
}
