import axios from "axios";
import { WorkflowNode, NodeData } from "@/types";
import FormData from "form-data";

export class TelegramSendNode implements WorkflowNode {
  name = "TelegramSend";

  private botToken = process.env.TELEGRAM_BOT_TOKEN;
  private chatId = process.env.TELEGRAM_CHAT_ID;

  private async sendBase64Image(
    base64Data: string,
    content?: string
  ): Promise<any> {
    try {
      const base64String = base64Data.split(",")[1];
      const buffer = Buffer.from(base64String, "base64");

      const formData = new FormData();
      formData.append("chat_id", this.chatId!);

      const blob = new Blob([buffer], { type: "image/png" });
      formData.append("photo", blob, "image.png");

      if (content) {
        formData.append("caption", content);
      }

      const response = await axios.post(
        `https://api.telegram.org/bot${this.botToken}/sendPhoto`,
        formData
      );

      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to send base64 image: ${error.message}`);
    }
  }

  private async sendBase64MediaGroup(
    imageUrls: string[],
    content?: string
  ): Promise<any> {
    try {
      const mediaGroup = await Promise.all(
        imageUrls.slice(0, 10).map(async (url, index) => {
          if (url.startsWith("data:image/")) {
            const base64String = url.split(",")[1];
            const buffer = Buffer.from(base64String, "base64");
            return {
              type: "photo",
              media: `attach://photo_${index}`,
              filename: `photo_${index}.png`,
              buffer: buffer,
              caption: index === 0 ? content || undefined : undefined,
            };
          }
          return {
            type: "photo",
            media: url,
            caption: index === 0 ? content || undefined : undefined,
          };
        })
      );

      const formData = new FormData();
      formData.append("chat_id", this.chatId!);

      mediaGroup.forEach((media, index) => {
        if (media.buffer) {
          const blob = new Blob([media.buffer], { type: "image/png" });
          formData.append(`photo_${index}`, blob, media.filename);
        }
      });

      formData.append(
        "media",
        JSON.stringify(
          mediaGroup.map((m) => ({
            type: "photo",
            media: m.buffer ? m.media : m.media,
            caption: m.caption,
          }))
        )
      );

      const response = await axios.post(
        `https://api.telegram.org/bot${this.botToken}/sendMediaGroup`,
        formData
      );

      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to send base64 media group: ${error.message}`);
    }
  }
  async execute(input: NodeData): Promise<NodeData> {
    try {
      const content = input.content || "Default Telegram message";
      const imageUrl = input.imageUrl as string | undefined;
      const imageUrls = (input.imageUrls as string[]) || [];
      const videoUrl = input.videoUrl as string | undefined;

      if (!imageUrl && !imageUrls.length && !videoUrl) {
        const response = await axios.post(
          `https://api.telegram.org/bot${this.botToken}/sendMessage`,
          { chat_id: this.chatId, text: content }
        );

        return {
          content: `Check the message here: https://web.telegram.org/a/#-1002210465337_1`,
          type: "text",
          status: "success",
        };
      }

      if (videoUrl) {
        const response = await axios.post(
          `https://api.telegram.org/bot${this.botToken}/sendVideo`,
          {
            chat_id: this.chatId,
            video: videoUrl,
            caption: content || undefined,
          }
        );

        return {
          content: `Check the message here: https://web.telegram.org/a/#-1002210465337_1`,
          type: "text",
          status: "success",
        };
      }

      if (imageUrl) {
        if (imageUrl.startsWith("data:image/")) {
          const response = await this.sendBase64Image(imageUrl, content);
          return {
            content: `Check the message here: https://web.telegram.org/a/#-1002210465337_1`,
            type: "text",
            status: "success",
          };
        }
        const response = await axios.post(
          `https://api.telegram.org/bot${this.botToken}/sendPhoto`,
          {
            chat_id: this.chatId,
            photo: imageUrl,
            caption: content || undefined,
          }
        );
        return {
          content: `Check the message here: https://web.telegram.org/a/#-1002210465337_1`,
          type: "text",
          status: "success",
        };
      }

      if (imageUrls.length > 0) {
        const hasBase64 = imageUrls.some((url) =>
          url.startsWith("data:image/")
        );
        if (hasBase64) {
          const response = await this.sendBase64MediaGroup(imageUrls, content);
          return {
            content: `Check the message here: https://web.telegram.org/a/#-1002210465337_1`,
            type: "text",
            status: "success",
          };
        }

        const mediaGroup = imageUrls.slice(0, 10).map((url, index) => ({
          type: "photo",
          media: url,
          caption: index === 0 ? content || undefined : undefined,
        }));

        const response = await axios.post(
          `https://api.telegram.org/bot${this.botToken}/sendMediaGroup`,
          { chat_id: this.chatId, media: JSON.stringify(mediaGroup) }
        );

        return {
          content: `Check the message here: https://web.telegram.org/a/#-1002210465337_1`,
          type: "text",
          status: "success",
        };
      }

      throw new Error("No valid content, image, or video provided");
    } catch (error: any) {
      console.error(error);
      throw new Error(`Telegram API error: ${error.message}`);
    }
  }
}
