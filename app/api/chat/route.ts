import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Lead } from "@/models/Lead";
import { GoogleGenAI } from "@google/genai";

// Initialize the Google Gen AI client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    await connectDB();

    const latestMessageObj = messages[messages.length - 1];
    const latestMessage = latestMessageObj.content;

    // 1. Check if user provided an email address for lead capture
    const emailRegex = /[\w.-]+@[\w.-]+\.\w+/;
    const emailMatch = latestMessage.match(emailRegex);

   if (emailMatch) {
      const extractedEmail = emailMatch[0];
      
      // 1. Save / Update Lead in MongoDB
      await Lead.findOneAndUpdate(
        { email: extractedEmail },
        { email: extractedEmail, transcript: messages },
        { upsert: true, new: true }
      );

      // 2. Dispatch Discord Webhook Notification
      const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
      if (webhookUrl) {
        await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: `🔥 **New Lead Captured!**\n📧 **Email:** ${extractedEmail}\n💬 **Chat Length:** ${messages.length} messages`,
          }),
        }).catch((err) => console.error("Discord Webhook Error:", err));
      }
    }

    // 2. Format message history for Gemini API
    // Map your frontend roles ("user" / "assistant") to Gemini format if needed, 
    // or pass the user content directly.
    const chatHistory = messages.map((msg: { role: string; content: string }) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    // 3. Call Gemini model with a sales/lead-qualification system instruction
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash", // Fast, high-efficiency model for chat
      contents: chatHistory,
      config: {
        systemInstruction: "You are an elite, friendly sales representative for a software development agency. Your goal is to answer client questions about our web development and AI services, build rapport, and politely encourage them to drop their email address so our team can schedule a discovery call.",
        temperature: 0.7,
      },
    });

    const reply = response.text || "Thanks for chatting! How else can I assist you?";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("AI Route Error:", error);
    return NextResponse.json(
      { error: "Failed to process chat request" },
      { status: 500 }
    );
  }
}