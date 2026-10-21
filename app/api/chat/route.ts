import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Lead } from "@/models/Lead";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const lastMessage = messages[messages.length - 1]?.content || "";

    // 1. Connect DB safely
    await connectDB();

    // 2. Safe Lead & Discord Processing (Non-blocking)
    const emailMatch = lastMessage.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);

    if (emailMatch) {
      const extractedEmail = emailMatch[0];

      try {
        await Lead.findOneAndUpdate(
          { email: extractedEmail },
          { email: extractedEmail, transcript: messages },
          { upsert: true, returnDocument: "after" }
        );

        const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
        if (webhookUrl) {
          await fetch(webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              content: `🔥 **New Lead Captured!**\n📧 **Email:** ${extractedEmail}\n💬 **Chat Length:** ${messages.length} messages`,
            }),
          });
        }
      } catch (err) {
        console.error("Background lead save/discord error:", err);
      }
    }
// 3. Generate Gemini AI Response (with safety fallback)
    let aiReply = "Thanks for your message! How can I help you further?";
    
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: messages.map((m: any) => ({
          role: m.role === "user" ? "user" : "model",
          parts: [{ text: m.content }],
        })),
      });
      if (response && response.text) {
        aiReply = response.text;
      }
    } catch (aiErr) {
      console.error("Gemini API Error:", aiErr);
      aiReply = "Got your message! (AI response temporarily busy, but your lead was saved)";
    }

    // 4. Return success response instantly to frontend
    return NextResponse.json({ reply: aiReply });

  } catch (error) {
    console.error("AI Route Error:", error);
    return NextResponse.json(
      { error: "Oops! Something went wrong on the server." },
      { status: 500 }
    );
  }
}