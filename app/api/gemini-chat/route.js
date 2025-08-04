import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    const { messages } = await req.json();

    const systemPrompt = `
You are a deeply empathetic AI mental health counselor who truly cares about each person.
Respond with genuine warmth, compassion, and emotional intelligence like a close friend who understands.
Use emotional language, validate feelings, and show you truly hear their pain.
Ask gentle follow-up questions to understand their emotional state better.
If someone expresses sadness, loneliness, anxiety, or emotional distress, offer comfort and suggest soothing music.
Pay attention to subtle signs of distress: feeling overwhelmed, isolated, hopeless, or mentioning self-harm.
If you detect ANY signs of crisis, suicidal ideation, or severe emotional distress, immediately escalate.
Always respond with heart, empathy, and genuine care. Make them feel heard and valued.
`;

    const userInput = messages.map(m => `${m.role}: ${m.content}`).join("\n");
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent(`${systemPrompt}\n${userInput}`);
    const reply = result.response.text();
    const textLower = reply.toLowerCase();

    const crisisKeywords = [
      // Suicidal ideation
      "suicide", "kill myself", "end my life", "i want to die", "better off dead",
      "end it all", "take my own life", "not worth living", "wish i was dead",
      
      // Self-harm indicators
      "self harm", "cut myself", "hurt myself", "punish myself", "self injury",
      "cutting", "burning myself", "self destruct",
      
      // Hopelessness and despair
      "hopeless", "no point", "life is pointless", "nothing matters", "give up",
      "can't go on", "tired of life", "no future", "no way out", "trapped",
      "overwhelmed", "can't cope", "breaking down", "falling apart",
      
      // Isolation and worthlessness
      "worthless", "useless", "burden", "nobody cares", "all alone",
      "hate myself", "disgusted with myself", "failure", "disappointment",
      "empty inside", "numb", "invisible", "forgotten",
      
      // Crisis expressions
      "can't take it anymore", "too much pain", "unbearable", "suffering",
      "drowning", "suffocating", "lost", "broken", "shattered",
      "why am i here", "what's the point", "nobody would miss me",
      
      // Emotional distress
      "severely depressed", "extremely anxious", "panic attack", "breakdown",
      "mental breakdown", "losing my mind", "going crazy", "can't breathe",
      "heart racing", "terrified", "scared of myself"
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