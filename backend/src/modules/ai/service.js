import { Groq } from "groq-sdk";
import { AppError } from "../../shared/errors.js";

const getGroqClient = () => {
  if (!process.env.GROQ_API_KEY) {
    throw new AppError("Groq API key is not configured. Please add it to your .env file.", 500);
  }
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
};

export const generateCampaignDescription = async (prompt) => {
  const groq = getGroqClient();
  const response = await groq.chat.completions.create({
    messages: [
      { role: "system", content: "You are an expert marketing copywriter helping a business create an engaging campaign description to attract influencers and promoters. Write a concise, compelling description based on the user's prompt." },
      { role: "user", content: prompt }
    ],
    model: "llama-3.3-70b-versatile",
    temperature: 0.7,
    max_tokens: 512,
  });
  return { text: response.choices[0]?.message?.content || "" };
};

export const generateProposalMessage = async (campaignDescription, promoterBackground) => {
  const groq = getGroqClient();
  const response = await groq.chat.completions.create({
    messages: [
      { role: "system", content: "You are a professional influencer/promoter applying for a brand campaign. Write a persuasive, concise proposal message explaining why you are a good fit." },
      { role: "user", content: `Campaign Description: ${campaignDescription}\n\nMy Background: ${promoterBackground}\n\nWrite my proposal:` }
    ],
    model: "llama-3.3-70b-versatile",
    temperature: 0.7,
    max_tokens: 300,
  });
  return { text: response.choices[0]?.message?.content || "" };
};

export const generateSocialContent = async (topic, platform) => {
  const groq = getGroqClient();
  const response = await groq.chat.completions.create({
    messages: [
      { role: "system", content: `You are an expert social media manager. Generate a catchy caption and relevant hashtags for ${platform}.` },
      { role: "user", content: `Topic: ${topic}` }
    ],
    model: "llama3-8b-8192",
    temperature: 0.7,
    max_tokens: 300,
  });
  return { text: response.choices[0]?.message?.content || "" };
};

export const chatWithAssistant = async (message) => {
  const groq = getGroqClient();
  const response = await groq.chat.completions.create({
    messages: [
      { role: "system", content: "You are a helpful AI assistant for the B2P Connect platform, which connects Businesses with Promoters/Influencers. Answer questions concisely and helpfully." },
      { role: "user", content: message }
    ],
    model: "llama3-8b-8192",
    temperature: 0.7,
    max_tokens: 512,
  });
  return { text: response.choices[0]?.message?.content || "" };
};
