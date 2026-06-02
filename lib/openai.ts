import OpenAI from "openai";

function getOpenAIClient() {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("Missing OPENAI_API_KEY");
  return new OpenAI({ apiKey: key });
}

export const openai = getOpenAIClient();

export const IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL ?? "dall-e-3";
