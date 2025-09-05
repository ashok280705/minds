import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Forward to prescription reader service
    const prescriptionFormData = new FormData();
    prescriptionFormData.append('file', file);

    const response = await fetch('http://localhost:5002/analyze', {
      method: 'POST',
      body: prescriptionFormData
    });

    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json({ error: data.error || "Analysis failed" }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Prescription reader error:', error);
    return NextResponse.json({ error: "Service unavailable" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const response = await fetch('http://localhost:5002/health');
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Service unavailable" }, { status: 500 });
  }
}