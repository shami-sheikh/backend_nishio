import asyncHandler from "../utils/asyncHandler.js";

export const generateCaption = asyncHandler(async (req, res, next) => {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/messages", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "Nishiogram",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "mistralai/mistral-7b-instruct:free",
        messages: [
          {
            role: "user",
            content: `You are a social media caption writer for an Instagram-style app called Nishiogram.

Generate exactly 3 creative Instagram captions.

Rules:
- Each caption should be fun, relatable, or aesthetic
- Include 3-5 relevant emojis per caption
- Include 3-5 hashtags at the end of each caption
- Keep each caption under 150 characters excluding hashtags
- Make them feel natural, not AI-generated
- Vary the tone: one funny, one aesthetic, one motivational

Respond ONLY with a JSON array of 3 strings. No explanation, no markdown, no backticks. Example:
["caption one 😂 #meme #funny #vibes", "caption two ✨ #aesthetic #art #style", "caption three 💪 #motivation #goals #grind"]`,
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "OpenRouter API error");
    }

    const text = data.choices?.[0]?.message?.content || "[]";

    let captions;
    try {
      captions = JSON.parse(text.trim());
      if (!Array.isArray(captions) || captions.length < 1) {
        throw new Error("Invalid response format");
      }
    } catch (parseErr) {
      console.error("Parse error:", parseErr);
      return next({ 
        status: 500, 
        message: "Failed to parse captions" 
      });
    }

    return res.status(200).json({ captions });

  } catch (error) {
    console.error("OpenRouter Error:", error);
    return next({ 
      status: 500, 
      message: "Failed to generate captions",
      extraDetails: error.message
    });
  }
});