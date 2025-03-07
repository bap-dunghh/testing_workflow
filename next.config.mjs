/** @type {import('next').NextConfig} */

const nextConfig = {
  env: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    IMAGE_API_KEY: process.env.IMAGE_API_KEY,
    FACEBOOK_ACCESS_TOKEN: process.env.FACEBOOK_ACCESS_TOKEN,
    GROK_API_KEY: process.env.GROK_API_KEY,
    DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY,
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
    LEONARDO_API_KEY: process.env.LEONARDO_API_KEY,
    GOOGLE_IMAGEFX_API_KEY: process.env.GOOGLE_IMAGEFX_API_KEY,
    MINIMAX_API_KEY: process.env.MINIMAX_API_KEY,
    IMAGE_PIC_API_KEY: process.env.IMAGE_PIC_API_KEY,
    PIKA_API_KEY: process.env.PIKA_API_KEY,
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
    TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID,
    FAL_API_KEY: process.env.FAL_API_KEY,
    HF_API_KEY: process.env.HF_API_KEY,
    FACEBOOK_PAGE_TOKEN: process.env.FACEBOOK_PAGE_TOKEN,
    FACEBOOK_PAGE_ID: process.env.FACEBOOK_PAGE_ID,
  },
};

export default nextConfig;
