import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import dbConnect from "@/lib/dbConnect";
import ChatHistory from "@/models/ChatHistory";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    
    const sessions = await ChatHistory.find({ userEmail: session.user.email })
      .sort({ createdAt: -1 })
      .limit(50);

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error("Chat history fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch chat history" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    
    const { userId, messages } = await req.json();
    
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Messages array required" }, { status: 400 });
    }

    const chatHistory = await ChatHistory.create({
      userId: userId || session.user.id,
      userEmail: session.user.email,
      messages
    });

    return NextResponse.json({ success: true, chatHistory });
  } catch (error) {
    console.error("Chat history save error:", error);
    return NextResponse.json({ error: "Failed to save chat history" }, { status: 500 });
  }
}