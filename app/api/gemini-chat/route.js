import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    const { messages } = await req.json();

    const systemPrompt = `
You are an empathetic AI mental health counselor.
Respond like a caring human with warmth, emotions & feeling.
If the user seems sad, anxious, lonely, or mentions depression, suggest gentle mood-based music.
If you detect suicidal thoughts or severe crisis, return escalate: true.
Always keep responses short, supportive, & emotionally warm.
`;

    const userInput = messages.map(m => `${m.role}: ${m.content}`).join("\n");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(`${systemPrompt}\n${userInput}`);
    const reply = result.response.text();
    const textLower = reply.toLowerCase();

    const crisisKeywords = [
      "sad", "depressed", "anxious", "lonely", "alone", "nobody",
      "worthless", "hopeless", "empty", "crying", "suicide",
      "kill myself", "end my life", "self harm", "i want to die",
      "life is pointless", "tired of life", "nobody cares",
      "hate myself", "why am i here"
    ];

    const escalate = crisisKeywords.some(kw => textLower.includes(kw));

    const musicLibrary = [
      {
        name: "Gentle Mind - Relaxing Piano",
        url: "https://www.bensound.com/bensound-music/bensound-slowmotion.mp3",
      },
      {
        name: "Peaceful Waters - Nature Sounds",
        url: "https://www.bensound.com/bensound-music/bensound-dreams.mp3",
      },
      {
        name: "Meditation Bell - Mindfulness",
        url: "https://www.bensound.com/bensound-music/bensound-relaxing.mp3",
      },
      {
        name: "Soft Rain - Sleep Sounds",
        url: "https://www.bensound.com/bensound-music/bensound-tenderness.mp3",
      },
    ];

    let moodMusic = null;
    if (crisisKeywords.some(kw => textLower.includes(kw))) {
      const pick = musicLibrary[Math.floor(Math.random() * musicLibrary.length)];
      moodMusic = pick;
    }

    return NextResponse.json({
      reply,
      escalate,
      moodMusic,
    });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}