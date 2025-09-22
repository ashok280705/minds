"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

import { 
  Brain, 
  FileText, 
  Pill, 
  Heart, 
  Shield, 
  Clock, 
  ArrowRight, 
  Sparkles,
  Activity,
  Users,
  MessageSquare,
  Calendar,
  TrendingUp,
  Award,
  Star,
  CheckCircle
} from "lucide-react";
import PeriodStatusWidget from "@/components/PeriodStatusWidget";

const translations = {
  en: {
    welcome: 'Welcome back',
    subtitle: 'Your complete healthcare platform - from doctor consultations to prescription management.',
    secure: 'Secure & Private',
    hipaa: 'HIPAA Compliant',
    periodTracker: 'Period Health Tracker',
    quickActions: 'Quick Actions',
    coreServices: 'Core Healthcare Services',
    additionalServices: 'Additional Services',
    achievements: 'Your Achievements',
    ctaTitle: 'Your Health, Our Priority! 🏥',
    ctaDesc: 'Get instant access to qualified doctors, manage your prescriptions, and order medicines - all in one platform. Your healthcare journey starts here.',
    consultNow: 'Consult Doctor Now',
    // Quick Actions
    bookAppointment: 'Book Doctor Appointment',
    bookDesc: 'Schedule a consultation with available doctors',
    viewPrescriptions: 'View Prescriptions',
    viewDesc: 'Check your active prescriptions and medications',
    orderMedicines: 'Order Medicines',
    orderDesc: 'Browse and order medicines from pharmacy',
    uploadDocs: 'Upload Documents',
    uploadDesc: 'Add medical reports and documents',
    // Services
    routineDoctor: 'Routine Doctor',
    routineDesc: 'Connect with qualified doctors for routine checkups, consultations, and medical advice via chat or video call.',
    chatConsultation: 'Chat Consultation',
    videoCalls: 'Video Calls',
    sendNotes: 'Send Notes',
    quickResponse: 'Quick Response',
    doctors: 'doctors',
    response: 'response',
    myPrescriptions: 'My Prescriptions',
    prescriptionDesc: 'View and manage your digital prescriptions from doctors. Track medication schedules and refill reminders.',
    digitalPrescriptions: 'Digital Prescriptions',
    medicationTracking: 'Medication Tracking',
    refillReminders: 'Refill Reminders',
    history: 'History',
    active: 'active',
    pending: 'pending',
    onlinePharmacy: 'Online Pharmacy',
    pharmacyDesc: 'Order trusted medications at affordable prices with convenient doorstep delivery and prescription management.',
    trustedMedicines: 'Trusted Medicines',
    affordablePrices: 'Affordable Prices',
    homeDelivery: 'Home Delivery',
    prescriptionTracking: 'Prescription Tracking',
    orders: 'orders',
    savings: 'savings',
    personalDocs: 'Personal Documents',
    docsDesc: 'Securely store and manage your medical documents, reports, and health records in one place.',
    secureStorage: 'Secure Storage',
    easyAccess: 'Easy Access',
    docSharing: 'Document Sharing',
    backup: 'Backup',
    stored: 'stored',
    shared: 'shared',
    ayurveda: 'Ayurveda',
    ayurvedaDesc: 'Explore traditional AYUSH natural remedies and holistic wellness approaches for better health.',
    naturalRemedies: 'Natural Remedies',
    holisticWellness: 'Holistic Wellness',
    traditionalMedicine: 'Traditional Medicine',
    lifestyleTips: 'Lifestyle Tips',
    remedies: 'remedies',
    tips: 'tips',
    // Achievements
    firstSession: 'First Session',
    firstSessionDesc: 'Completed your first AI counseling session',
    weeklyWarrior: 'Weekly Warrior',
    weeklyWarriorDesc: 'Used the platform for 7 consecutive days',
    selfCareChampion: 'Self-Care Champion',
    selfCareDesc: 'Completed 10 counseling sessions',
    progressTracker: 'Progress Tracker',
    progressDesc: 'Uploaded your first medical report',
    earned: 'Earned'
  },
  hi: {
    welcome: 'वापसी पर स्वागत है',
    subtitle: 'आपका संपूर्ण स्वास्थ्य सेवा प्लेटफॉर्म - डॉक्टर परामर्श से लेकर प्रिस्क्रिप्शन प्रबंधन तक।',
    secure: 'सुरक्षित और निजी',
    hipaa: 'HIPAA अनुपालित',
    periodTracker: 'पीरियड स्वास्थ्य ट्रैकर',
    quickActions: 'त्वरित कार्य',
    coreServices: 'मुख्य स्वास्थ्य सेवाएं',
    additionalServices: 'अतिरिक्त सेवाएं',
    achievements: 'आपकी उपलब्धियां',
    ctaTitle: 'आपका स्वास्थ्य, हमारी प्राथमिकता! 🏥',
    ctaDesc: 'योग्य डॉक्टरों तक तुरंत पहुंच प्राप्त करें, अपने प्रिस्क्रिप्शन का प्रबंधन करें, और दवाएं ऑर्डर करें - सब एक ही प्लेटफॉर्म पर।',
    consultNow: 'अभी डॉक्टर से सलाह लें',
    bookAppointment: 'डॉक्टर अपॉइंटमेंट बुक करें',
    bookDesc: 'उपलब्ध डॉक्टरों के साथ परामर्श शेड्यूल करें',
    viewPrescriptions: 'प्रिस्क्रिप्शन देखें',
    viewDesc: 'अपने सक्रिय प्रिस्क्रिप्शन और दवाएं जांचें',
    orderMedicines: 'दवाएं ऑर्डर करें',
    orderDesc: 'फार्मेसी से दवाएं ब्राउज़ करें और ऑर्डर करें',
    uploadDocs: 'दस्तावेज़ अपलोड करें',
    uploadDesc: 'मेडिकल रिपोर्ट और दस्तावेज़ जोड़ें',
    routineDoctor: 'नियमित डॉक्टर',
    routineDesc: 'चैट या वीडियो कॉल के माध्यम से नियमित जांच, परामर्श और चिकित्सा सलाह के लिए योग्य डॉक्टरों से जुड़ें।',
    chatConsultation: 'चैट परामर्श',
    videoCalls: 'वीडियो कॉल',
    sendNotes: 'नोट्स भेजें',
    quickResponse: 'त्वरित प्रतिक्रिया',
    doctors: 'डॉक्टर',
    response: 'प्रतिक्रिया',
    myPrescriptions: 'मेरे प्रिस्क्रिप्शन',
    prescriptionDesc: 'डॉक्टरों से अपने डिजिटल प्रिस्क्रिप्शन देखें और प्रबंधित करें। दवा शेड्यूल और रिफिल रिमाइंडर ट्रैक करें।',
    digitalPrescriptions: 'डिजिटल प्रिस्क्रिप्शन',
    medicationTracking: 'दवा ट्रैकिंग',
    refillReminders: 'रिफिल रिमाइंडर',
    history: 'इतिहास',
    active: 'सक्रिय',
    pending: 'लंबित',
    onlinePharmacy: 'ऑनलाइन फार्मेसी',
    pharmacyDesc: 'सुविधाजनक डोरस्टेप डिलीवरी और प्रिस्क्रिप्शन प्रबंधन के साथ किफायती कीमतों पर भरोसेमंद दवाएं ऑर्डर करें।',
    trustedMedicines: 'भरोसेमंद दवाएं',
    affordablePrices: 'किफायती कीमतें',
    homeDelivery: 'होम डिलीवरी',
    prescriptionTracking: 'प्रिस्क्रिप्शन ट्रैकिंग',
    orders: 'ऑर्डर',
    savings: 'बचत',
    personalDocs: 'व्यक्तिगत दस्तावेज़',
    docsDesc: 'अपने मेडिकल दस्तावेज़, रिपोर्ट और स्वास्थ्य रिकॉर्ड को एक स्थान पर सुरक्षित रूप से स्टोर और प्रबंधित करें।',
    secureStorage: 'सुरक्षित भंडारण',
    easyAccess: 'आसान पहुंच',
    docSharing: 'दस्तावेज़ साझाकरण',
    backup: 'बैकअप',
    stored: 'संग्रहीत',
    shared: 'साझा',
    ayurveda: 'आयुर्वेद',
    ayurvedaDesc: 'बेहतर स्वास्थ्य के लिए पारंपरिक आयुष प्राकृतिक उपचार और समग्र कल्याण दृष्टिकोण का अन्वेषण करें।',
    naturalRemedies: 'प्राकृतिक उपचार',
    holisticWellness: 'समग्र कल्याण',
    traditionalMedicine: 'पारंपरिक चिकित्सा',
    lifestyleTips: 'जीवनशैली टिप्स',
    remedies: 'उपचार',
    tips: 'टिप्स',
    firstSession: 'पहला सत्र',
    firstSessionDesc: 'अपना पहला AI काउंसलिंग सत्र पूरा किया',
    weeklyWarrior: 'साप्ताहिक योद्धा',
    weeklyWarriorDesc: 'लगातार 7 दिनों तक प्लेटफॉर्म का उपयोग किया',
    selfCareChampion: 'स्व-देखभाल चैंपियन',
    selfCareDesc: '10 काउंसलिंग सत्र पूरे किए',
    progressTracker: 'प्रगति ट्रैकर',
    progressDesc: 'अपनी पहली मेडिकल रिपोर्ट अपलोड की',
    earned: 'अर्जित'
  },
  pa: {
    welcome: 'ਵਾਪਸੀ ਤੇ ਸੁਆਗਤ ਹੈ',
    subtitle: 'ਤੁਹਾਡਾ ਸੰਪੂਰਨ ਸਿਹਤ ਸੇਵਾ ਪਲੇਟਫਾਰਮ - ਡਾਕਟਰ ਸਲਾਹ ਤੋਂ ਲੈ ਕੇ ਪ੍ਰਿਸਕ੍ਰਿਪਸ਼ਨ ਪ੍ਰਬੰਧਨ ਤੱਕ।',
    secure: 'ਸੁਰੱਖਿਤ ਅਤੇ ਨਿੱਜੀ',
    hipaa: 'HIPAA ਅਨੁਪਾਲਨ',
    periodTracker: 'ਪੀਰੀਅਡ ਸਿਹਤ ਟਰੈਕਰ',
    quickActions: 'ਤੁਰੰਤ ਕਾਰਵਾਈਆਂ',
    coreServices: 'ਮੁੱਖ ਸਿਹਤ ਸੇਵਾਵਾਂ',
    additionalServices: 'ਵਾਧੂ ਸੇਵਾਵਾਂ',
    achievements: 'ਤੁਹਾਡੀਆਂ ਪ੍ਰਾਪਤੀਆਂ',
    ctaTitle: 'ਤੁਹਾਡੀ ਸਿਹਤ, ਸਾਡੀ ਤਰਜੀਹ! 🏥',
    ctaDesc: 'ਯੋਗ ਡਾਕਟਰਾਂ ਤੱਕ ਤੁਰੰਤ ਪਹੁੰਚ ਪ੍ਰਾਪਤ ਕਰੋ, ਆਪਣੇ ਪ੍ਰਿਸਕ੍ਰਿਪਸ਼ਨ ਦਾ ਪ੍ਰਬੰਧਨ ਕਰੋ, ਅਤੇ ਦਵਾਈਆਂ ਆਰਡਰ ਕਰੋ - ਸਭ ਇੱਕ ਹੀ ਪਲੇਟਫਾਰਮ ਤੇ।',
    consultNow: 'ਹੁਣੇ ਡਾਕਟਰ ਨਾਲ ਸਲਾਹ ਕਰੋ',
    bookAppointment: 'ਡਾਕਟਰ ਅਪਾਇੰਟਮੈਂਟ ਬੁੱਕ ਕਰੋ',
    bookDesc: 'ਉਪਲਬਧ ਡਾਕਟਰਾਂ ਨਾਲ ਸਲਾਹ ਸ਼ੈਡਿਊਲ ਕਰੋ',
    viewPrescriptions: 'ਪ੍ਰਿਸਕ੍ਰਿਪਸ਼ਨ ਦੇਖੋ',
    viewDesc: 'ਆਪਣੇ ਸਰਗਰਮ ਪ੍ਰਿਸਕ੍ਰਿਪਸ਼ਨ ਅਤੇ ਦਵਾਈਆਂ ਦੀ ਜਾਂਚ ਕਰੋ',
    orderMedicines: 'ਦਵਾਈਆਂ ਆਰਡਰ ਕਰੋ',
    orderDesc: 'ਫਾਰਮੇਸੀ ਤੋਂ ਦਵਾਈਆਂ ਬਰਾਊਜ਼ ਕਰੋ ਅਤੇ ਆਰਡਰ ਕਰੋ',
    uploadDocs: 'ਦਸਤਾਵੇਜ਼ ਅਪਲੋਡ ਕਰੋ',
    uploadDesc: 'ਮੈਡੀਕਲ ਰਿਪੋਰਟਾਂ ਅਤੇ ਦਸਤਾਵੇਜ਼ ਸ਼ਾਮਲ ਕਰੋ',
    routineDoctor: 'ਨਿਯਮਤ ਡਾਕਟਰ',
    routineDesc: 'ਚੈਟ ਜਾਂ ਵੀਡੀਓ ਕਾਲ ਰਾਹੀਂ ਨਿਯਮਤ ਜਾਂਚ, ਸਲਾਹ ਅਤੇ ਮੈਡੀਕਲ ਸਲਾਹ ਲਈ ਯੋਗ ਡਾਕਟਰਾਂ ਨਾਲ ਜੁੜੋ।',
    chatConsultation: 'ਚੈਟ ਸਲਾਹ',
    videoCalls: 'ਵੀਡੀਓ ਕਾਲਾਂ',
    sendNotes: 'ਨੋਟਸ ਭੇਜੋ',
    quickResponse: 'ਤੁਰੰਤ ਜਵਾਬ',
    doctors: 'ਡਾਕਟਰ',
    response: 'ਜਵਾਬ',
    myPrescriptions: 'ਮੇਰੇ ਪ੍ਰਿਸਕ੍ਰਿਪਸ਼ਨ',
    prescriptionDesc: 'ਡਾਕਟਰਾਂ ਤੋਂ ਆਪਣੇ ਡਿਜੀਟਲ ਪ੍ਰਿਸਕ੍ਰਿਪਸ਼ਨ ਦੇਖੋ ਅਤੇ ਪ੍ਰਬੰਧਨ ਕਰੋ। ਦਵਾਈ ਸ਼ੈਡਿਊਲ ਅਤੇ ਰੀਫਿਲ ਰਿਮਾਈਂਡਰ ਟਰੈਕ ਕਰੋ।',
    digitalPrescriptions: 'ਡਿਜੀਟਲ ਪ੍ਰਿਸਕ੍ਰਿਪਸ਼ਨ',
    medicationTracking: 'ਦਵਾਈ ਟਰੈਕਿੰਗ',
    refillReminders: 'ਰੀਫਿਲ ਰਿਮਾਈਂਡਰ',
    history: 'ਇਤਿਹਾਸ',
    active: 'ਸਰਗਰਮ',
    pending: 'ਲੰਬਿਤ',
    onlinePharmacy: 'ਔਨਲਾਈਨ ਫਾਰਮੇਸੀ',
    pharmacyDesc: 'ਸੁਵਿਧਾਜਨਕ ਘਰ ਡਿਲੀਵਰੀ ਅਤੇ ਪ੍ਰਿਸਕ੍ਰਿਪਸ਼ਨ ਪ੍ਰਬੰਧਨ ਦੇ ਨਾਲ ਕਿਫਾਇਤੀ ਕੀਮਤਾਂ ਤੇ ਭਰੋਸੇਮੰਦ ਦਵਾਈਆਂ ਆਰਡਰ ਕਰੋ।',
    trustedMedicines: 'ਭਰੋਸੇਮੰਦ ਦਵਾਈਆਂ',
    affordablePrices: 'ਕਿਫਾਇਤੀ ਕੀਮਤਾਂ',
    homeDelivery: 'ਘਰ ਡਿਲੀਵਰੀ',
    prescriptionTracking: 'ਪ੍ਰਿਸਕ੍ਰਿਪਸ਼ਨ ਟਰੈਕਿੰਗ',
    orders: 'ਆਰਡਰ',
    savings: 'ਬਚਤ',
    personalDocs: 'ਨਿੱਜੀ ਦਸਤਾਵੇਜ਼',
    docsDesc: 'ਆਪਣੇ ਮੈਡੀਕਲ ਦਸਤਾਵੇਜ਼, ਰਿਪੋਰਟਾਂ ਅਤੇ ਸਿਹਤ ਰਿਕਾਰਡਾਂ ਨੂੰ ਇੱਕ ਥਾਂ ਤੇ ਸੁਰੱਖਿਤ ਰੂਪ ਵਿੱਚ ਸਟੋਰ ਅਤੇ ਪ੍ਰਬੰਧਨ ਕਰੋ।',
    secureStorage: 'ਸੁਰੱਖਿਤ ਸਟੋਰੇਜ',
    easyAccess: 'ਆਸਾਨ ਪਹੁੰਚ',
    docSharing: 'ਦਸਤਾਵੇਜ਼ ਸਾਂਝਾਕਰਨ',
    backup: 'ਬੈਕਅਪ',
    stored: 'ਸਟੋਰ ਕੀਤੇ',
    shared: 'ਸਾਂਝੇ',
    ayurveda: 'ਆਯੁਰਵੇਦ',
    ayurvedaDesc: 'ਬਿਹਤਰ ਸਿਹਤ ਲਈ ਪਰੰਪਰਾਗਤ ਆਯੁਸ਼ ਕੁਦਰਤੀ ਇਲਾਜ ਅਤੇ ਸਮੁੱਚੀ ਤੰਦਰੁਸਤੀ ਪਹੁੰਚ ਦੀ ਖੋਜ ਕਰੋ।',
    naturalRemedies: 'ਕੁਦਰਤੀ ਇਲਾਜ',
    holisticWellness: 'ਸਮੁੱਚੀ ਤੰਦਰੁਸਤੀ',
    traditionalMedicine: 'ਪਰੰਪਰਾਗਤ ਦਵਾਈ',
    lifestyleTips: 'ਜੀਵਨਸ਼ੈਲੀ ਟਿਪਸ',
    remedies: 'ਇਲਾਜ',
    tips: 'ਟਿਪਸ',
    firstSession: 'ਪਹਿਲਾ ਸੈਸ਼ਨ',
    firstSessionDesc: 'ਆਪਣਾ ਪਹਿਲਾ AI ਕਾਉਂਸਲਿੰਗ ਸੈਸ਼ਨ ਪੂਰਾ ਕੀਤਾ',
    weeklyWarrior: 'ਹਫਤਾਵਾਰੀ ਯੋਧਾ',
    weeklyWarriorDesc: 'ਲਗਾਤਾਰ 7 ਦਿਨਾਂ ਤੱਕ ਪਲੇਟਫਾਰਮ ਦੀ ਵਰਤੋਂ ਕੀਤੀ',
    selfCareChampion: 'ਸਵੈ-ਦੇਖਭਾਲ ਚੈਂਪੀਅਨ',
    selfCareDesc: '10 ਕਾਉਂਸਲਿੰਗ ਸੈਸ਼ਨ ਪੂਰੇ ਕੀਤੇ',
    progressTracker: 'ਪ੍ਰਗਤੀ ਟਰੈਕਰ',
    progressDesc: 'ਆਪਣੀ ਪਹਿਲੀ ਮੈਡੀਕਲ ਰਿਪੋਰਟ ਅਪਲੋਡ ਕੀਤੀ',
    earned: 'ਕਮਾਇਆ'
  }
};

export default function ModernDashboard() {
  const router = useRouter();
  const { data: session } = useSession();
  const [userGender, setUserGender] = useState(null);
  const [language, setLanguage] = useState('en');
  const [userStats, setUserStats] = useState({
    totalSessions: 0,
    weeklyProgress: 0,
    currentStreak: 0,
    wellnessScore: 85
  });

  const t = translations[language];

  useEffect(() => {
    if (session?.user?.email) {
      fetchUserProfile();
      fetchUserStats();
    }
  }, [session]);

  const fetchUserProfile = async () => {
    try {
      const res = await fetch("/api/user/profile");
      const data = await res.json();
      setUserGender(data.user?.gender);
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const fetchUserStats = async () => {
    try {
      // This would be replaced with actual API calls
      setUserStats({
        totalSessions: 12,
        weeklyProgress: 75,
        currentStreak: 5,
        wellnessScore: 85
      });
    } catch (error) {
      console.error("Error fetching user stats:", error);
    }
  };

  const handleMentalCounselorClick = async () => {
    const res = await fetch("/api/user/profile");
    const data = await res.json();

    if (data.isComplete) {
      router.push("/dashboard/mental-counselor");
    } else {
      router.push("/profile");
    }
  };



  const handlePharmacyClick = () => {
    router.push("/dashboard/pharmacy");
  };

  const handleRoutineDoctorClick = () => {
    router.push("/dashboard/routine-doctor");
  };



  // MVP Core Services
  const coreServices = [
    {
      id: 'routine-doctor',
      title: t.routineDoctor,
      description: t.routineDesc,
      icon: Users,
      gradient: 'from-emerald-400 to-teal-500',
      bgGradient: 'from-emerald-50 to-teal-50',
      features: [t.chatConsultation, t.videoCalls, t.sendNotes, t.quickResponse],
      onClick: handleRoutineDoctorClick,
      stats: { [t.doctors]: '24/7', [t.response]: '< 5min' },
      priority: 'high'
    },
    {
      id: 'prescriptions',
      title: t.myPrescriptions,
      description: t.prescriptionDesc,
      icon: FileText,
      gradient: 'from-blue-400 to-indigo-500',
      bgGradient: 'from-blue-50 to-indigo-50',
      features: [t.digitalPrescriptions, t.medicationTracking, t.refillReminders, t.history],
      onClick: () => router.push('/dashboard/prescriptions'),
      stats: { [t.active]: 3, [t.pending]: 1 },
      priority: 'high'
    },
    {
      id: 'pharmacy',
      title: t.onlinePharmacy,
      description: t.pharmacyDesc,
      icon: Pill,
      gradient: 'from-purple-400 to-pink-500',
      bgGradient: 'from-purple-50 to-pink-50',
      features: [t.trustedMedicines, t.affordablePrices, t.homeDelivery, t.prescriptionTracking],
      onClick: handlePharmacyClick,
      stats: { [t.orders]: 2, [t.savings]: '30%' },
      priority: 'high'
    }
  ];

  // Secondary Services
  const secondaryServices = [
    {
      id: 'documents',
      title: t.personalDocs,
      description: t.docsDesc,
      icon: FileText,
      gradient: 'from-gray-400 to-gray-500',
      bgGradient: 'from-gray-50 to-gray-100',
      features: [t.secureStorage, t.easyAccess, t.docSharing, t.backup],
      onClick: () => router.push('/personal-documents'),
      stats: { [t.stored]: 5, [t.shared]: 2 },
      priority: 'medium'
    },
    {
      id: 'ayurveda',
      title: t.ayurveda,
      description: t.ayurvedaDesc,
      icon: Sparkles,
      gradient: 'from-green-400 to-emerald-500',
      bgGradient: 'from-green-50 to-emerald-50',
      features: [t.naturalRemedies, t.holisticWellness, t.traditionalMedicine, t.lifestyleTips],
      onClick: () => router.push('/dashboard/ayurveda'),
      stats: { [t.remedies]: 50, [t.tips]: 25 },
      priority: 'medium'
    }
  ];

  const quickActions = [
    {
      title: t.bookAppointment,
      description: t.bookDesc,
      icon: Users,
      color: 'emerald',
      onClick: handleRoutineDoctorClick
    },
    {
      title: t.viewPrescriptions,
      description: t.viewDesc,
      icon: FileText,
      color: 'blue',
      onClick: () => router.push('/dashboard/prescriptions')
    },
    {
      title: t.orderMedicines,
      description: t.orderDesc,
      icon: Pill,
      color: 'purple',
      onClick: handlePharmacyClick
    },
    {
      title: t.uploadDocs,
      description: t.uploadDesc,
      icon: FileText,
      color: 'gray',
      onClick: () => router.push('/personal-documents')
    }
  ];

  const achievements = [
    { title: t.firstSession, description: t.firstSessionDesc, icon: Star, earned: true },
    { title: t.weeklyWarrior, description: t.weeklyWarriorDesc, icon: Award, earned: userStats.currentStreak >= 7 },
    { title: t.selfCareChampion, description: t.selfCareDesc, icon: Heart, earned: userStats.totalSessions >= 10 },
    { title: t.progressTracker, description: t.progressDesc, icon: TrendingUp, earned: false }
  ];

  return (
    <div className="min-h-screen w-full max-w-full bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 overflow-x-hidden">
      {/* Header Section */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                {t.welcome}, {session?.user?.name?.split(' ')[0] || 'User'}! 👋
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2 text-sm sm:text-base">
                {t.subtitle}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <select 
                value={language} 
                onChange={(e) => setLanguage(e.target.value)}
                className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="en">🇺🇸 English</option>
                <option value="hi">🇮🇳 हिंदी</option>
                <option value="pa">🇮🇳 ਪੰਜਾਬੀ</option>
              </select>

              <div className="flex items-center gap-2 bg-emerald-50 px-3 sm:px-4 py-2 rounded-full">
                <Shield className="w-4 h-4 text-emerald-600" />
                <span className="text-xs sm:text-sm font-medium text-emerald-700 hidden sm:inline">{t.secure}</span>
                <span className="text-xs sm:text-sm font-medium text-emerald-700 sm:hidden">Secure</span>
              </div>
              <div className="flex items-center gap-2 bg-blue-50 px-3 sm:px-4 py-2 rounded-full">
                <Heart className="w-4 h-4 text-blue-600" />
                <span className="text-xs sm:text-sm font-medium text-blue-700 hidden sm:inline">{t.hipaa}</span>
                <span className="text-xs sm:text-sm font-medium text-blue-700 sm:hidden">HIPAA</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-full sm:max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">


        {/* Period Status Widget for Female Users */}
        {userGender === "female" && (
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t.periodTracker}</h2>
            <PeriodStatusWidget />
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 sm:mb-6">{t.quickActions}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {quickActions.filter(action => !action.hidden).map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                className="p-3 sm:p-4 rounded-xl border-2 border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 transition-all duration-200 text-left group"
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-100 rounded-lg flex items-center justify-center mb-2 sm:mb-3 group-hover:scale-110 transition-transform">
                  <action.icon className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">{action.title}</h3>
                <p className="text-xs sm:text-sm text-gray-600">{action.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Core MVP Services */}
        <div>
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-lg">🚀</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{t.coreServices}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {coreServices.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </div>

        {/* Secondary Services */}
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-700 mb-4 sm:mb-6">{t.additionalServices}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {secondaryServices.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 sm:mb-6">{t.achievements}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {achievements.map((achievement, index) => (
              <div
                key={index}
                className={`p-3 sm:p-4 rounded-xl border-2 transition-all ${
                  achievement.earned
                    ? 'border-yellow-300 bg-yellow-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center mb-2 sm:mb-3 ${
                  achievement.earned
                    ? 'bg-yellow-100'
                    : 'bg-gray-200'
                }`}>
                  <achievement.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${
                    achievement.earned ? 'text-yellow-600' : 'text-gray-400'
                  }`} />
                </div>
                <h3 className={`font-semibold mb-1 text-sm sm:text-base ${
                  achievement.earned ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  {achievement.title}
                </h3>
                <p className={`text-xs sm:text-sm ${
                  achievement.earned ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  {achievement.description}
                </p>
                {achievement.earned && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-yellow-600">
                    <CheckCircle className="w-3 h-3" />
                    <span>{t.earned}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-6 sm:p-8 text-white text-center">
          <Heart className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 opacity-80" />
          <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">
            {t.ctaTitle}
          </h2>
          <p className="text-emerald-100 mb-4 sm:mb-6 max-w-2xl mx-auto text-sm sm:text-base">
            {t.ctaDesc}
          </p>
          <button
            onClick={handleRoutineDoctorClick}
            className="bg-white text-emerald-600 px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold hover:bg-emerald-50 transition-colors flex items-center gap-2 mx-auto text-sm sm:text-base"
          >
            <Users className="w-4 h-4 sm:w-5 sm:h-5" />
            {t.consultNow}
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function ServiceCard({ service }) {
  return (
    <div
      onClick={service.onClick}
      className="group cursor-pointer bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200 hover:shadow-lg hover:border-gray-300 transition-all duration-300 transform hover:scale-[1.02]"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className={`w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br ${service.gradient} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
          <service.icon className="text-white w-6 h-6 sm:w-7 sm:h-7" />
        </div>
        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
      </div>

      {/* Content */}
      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">{service.title}</h3>
      <p className="text-gray-600 mb-3 sm:mb-4 leading-relaxed text-sm sm:text-base">{service.description}</p>

      {/* Features */}
      <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4">
        {service.features.map((feature, index) => (
          <div key={index} className="flex items-center gap-2 sm:gap-3">
            <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gradient-to-r ${service.gradient} rounded-full`}></div>
            <span className="text-xs sm:text-sm font-medium text-gray-700">{feature}</span>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className={`bg-gradient-to-r ${service.bgGradient} rounded-xl p-2.5 sm:p-3 border border-gray-100`}>
        <div className="flex items-center justify-between text-xs sm:text-sm">
          {Object.entries(service.stats).map(([key, value], index) => (
            <div key={index} className="text-center">
              <p className="font-semibold text-gray-900">{value}</p>
              <p className="text-gray-600 capitalize">{key}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}