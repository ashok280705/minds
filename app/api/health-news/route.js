import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || 'general';
    const type = searchParams.get('type') || 'news';
    
    const categoryQueries = {
      general: 'healthcare OR medical OR hospital',
      mental: 'mental health OR psychology OR depression OR anxiety',
      cardiology: 'heart disease OR cardiology OR cardiac OR cardiovascular',
      diabetes: 'diabetes OR blood sugar OR insulin OR diabetic',
      cancer: 'cancer OR oncology OR tumor OR chemotherapy',
      pediatrics: 'pediatrics OR child health OR vaccination OR infant',
      neurology: 'neurology OR brain OR alzheimer OR parkinson OR stroke',
      orthopedics: 'orthopedics OR bone OR joint OR fracture OR spine',
      dermatology: 'dermatology OR skin OR acne OR eczema OR psoriasis',
      gynecology: 'gynecology OR women health OR pregnancy OR menstrual',
      ophthalmology: 'ophthalmology OR eye OR vision OR cataract OR glaucoma',
      dentistry: 'dentistry OR dental OR teeth OR oral health',
      nutrition: 'nutrition OR diet OR vitamins OR healthy eating',
      pharmacy: 'pharmacy OR medicines OR drugs OR prescription',
      emergency: 'emergency medicine OR trauma OR first aid OR ambulance'
    };
    
    const schemes = {
      insurance: 'Ayushman Bharat scheme OR PMJAY OR health insurance scheme India OR Rashtriya Swasthya Bima Yojana',
      maternal: 'Janani Suraksha Yojana OR Pradhan Mantri Matru Vandana Yojana OR maternal health scheme India OR child health program',
      disease: 'National Health Mission OR disease control program India OR TB control OR malaria control OR HIV AIDS control',
      primary: 'Ayushman Bharat Health and Wellness Centre OR primary healthcare scheme India OR preventive healthcare program',
      nutrition: 'Anemia Mukt Bharat OR nutrition scheme India OR POSHAN Abhiyaan OR mid day meal scheme OR ICDS',
      ayush: 'AYUSH scheme India OR traditional medicine program OR Ayurveda scheme OR homeopathy program OR yoga wellness',
      rural: 'National Rural Health Mission OR tribal health scheme India OR ASHA worker program OR rural healthcare initiative',
      mental: 'National Mental Health Programme OR District Mental Health Programme OR disability scheme India OR mental health policy'
    };
    
    const query = type === 'schemes' ? schemes[category] : categoryQueries[category];
    
    const response = await fetch("https://google.serper.dev/news", {
      method: "POST",
      headers: {
        "X-API-KEY": "b15321aee5370f5e506e764fb6141b8fa80c4d0f",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        q: query,
        num: 15,
        gl: "in"
      })
    });

    const data = await response.json();
    return NextResponse.json(data.news || []);
  } catch (error) {
    console.error('News API error:', error);
    return NextResponse.json({ error: "Failed to fetch news" }, { status: 500 });
  }
}