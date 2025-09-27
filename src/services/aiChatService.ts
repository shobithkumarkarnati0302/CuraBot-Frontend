import { GoogleGenerativeAI } from '@google/generative-ai';
const DEBUG_TTS = (import.meta as any)?.env?.VITE_DEBUG_TTS === 'true';

// Medical Knowledge Base
const MEDICAL_KNOWLEDGE_BASE = {
  symptoms: {
    fever: {
      description: "Elevated body temperature above normal range (98.6°F/37°C)",
      commonCauses: ["Infection", "Inflammation", "Heat exhaustion", "Medication side effects"],
      whenToSeek: "Seek immediate care if fever exceeds 103°F (39.4°C) or persists for more than 3 days",
      homeRemedies: ["Rest", "Stay hydrated", "Use fever reducers as directed"]
    },
    headache: {
      description: "Pain in the head or neck region",
      commonCauses: ["Tension", "Dehydration", "Stress", "Sinus issues", "Migraine"],
      whenToSeek: "Seek care for sudden severe headaches, headaches with fever, or persistent headaches",
      homeRemedies: ["Rest in dark room", "Stay hydrated", "Apply cold/warm compress"]
    },
    cough: {
      description: "Reflex action to clear airways",
      commonCauses: ["Cold", "Allergies", "Asthma", "Acid reflux", "Infection"],
      whenToSeek: "Seek care for persistent cough over 2 weeks, blood in cough, or difficulty breathing",
      homeRemedies: ["Stay hydrated", "Use humidifier", "Honey for throat soothing"]
    },
    chestPain: {
      description: "Discomfort or pain in chest area",
      commonCauses: ["Heart issues", "Muscle strain", "Acid reflux", "Anxiety"],
      whenToSeek: "Seek immediate emergency care for chest pain with shortness of breath, sweating, or radiating pain",
      homeRemedies: ["Rest", "Avoid triggers", "Deep breathing exercises"]
    }
  },
  procedures: {
    bloodTest: {
      description: "Laboratory analysis of blood sample",
      preparation: ["Fast 8-12 hours if required", "Stay hydrated", "Wear comfortable clothing"],
      duration: "5-10 minutes",
      results: "Usually available within 24-48 hours"
    },
    xray: {
      description: "Imaging test using electromagnetic radiation",
      preparation: ["Remove jewelry and metal objects", "Wear comfortable clothing"],
      duration: "10-15 minutes",
      results: "Usually available within 24 hours"
    },
    mri: {
      description: "Magnetic resonance imaging for detailed internal images",
      preparation: ["Remove all metal objects", "May require contrast dye", "Inform about claustrophobia"],
      duration: "30-60 minutes",
      results: "Usually available within 24-48 hours"
    }
  },
  specialties: {
    cardiology: "Heart and cardiovascular system disorders",
    neurology: "Brain, spinal cord, and nervous system disorders",
    orthopedics: "Bones, joints, muscles, and connective tissues",
    dermatology: "Skin, hair, and nail conditions",
    gastroenterology: "Digestive system disorders",
    endocrinology: "Hormone and gland disorders",
    pulmonology: "Lung and respiratory system disorders",
    psychiatry: "Mental health and behavioral disorders"
  }
};

// Language translations
const TRANSLATIONS = {
  en: {
    greeting: "Hello! I'm your CuraBot assistant. How can I help you today?",
    appointment: "You can book an appointment by visiting our Appointments page.",
    emergency: "🚨 For medical emergencies, please call our 24/7 emergency hotline immediately.",
    thanks: "You're welcome! Is there anything else I can help you with?",
    default: "I'm here to help with appointments, finding doctors, accessing reports, and other medical services."
  },
  hi: {
    greeting: "नमस्ते! मैं आपका CuraBot सहायक हूं। आज मैं आपकी कैसे मदद कर सकता हूं?",
    appointment: "आप हमारे अपॉइंटमेंट पेज पर जाकर अपॉइंटमेंट बुक कर सकते हैं।",
    emergency: "🚨 मेडिकल इमरजेंसी के लिए, कृपया तुरंत हमारी 24/7 इमरजेंसी हॉटलाइन पर कॉल करें।",
    thanks: "आपका स्वागत है! क्या कोई और चीज़ है जिसमें मैं आपकी मदद कर सकता हूं?",
    default: "मैं अपॉइंटमेंट, डॉक्टर खोजने, रिपोर्ट्स एक्सेस करने और अन्य मेडिकल सेवाओं में मदद के लिए यहां हूं।"
  },
  te: {
    greeting: "నమస్తే! నేను మీ కురాబాట్ సహాయకుడు. ఈరోజు మీకు ఎలా సహాయం చేయగలను?",
    appointment: "మీరు మా అపాయింట్మెంట్స్ పేజీకి వెళ్లి అపాయింట్మెంట్ బుక్ చేయవచ్చు.",
    emergency: "🚨 అత్యవసర వైద్య సహాయం కోసం దయచేసి వెంటనే మా 24/7 ఎమర్జెన్సీ హాట్‌లైన్‌కు కాల్ చేయండి.",
    thanks: "మీకు స్వాగతం! మరేదైనా సహాయం కావాలా?",
    default: "అపాయింట్‌మెంట్లు, డాక్టర్లను కనుగొనడం, రిపోర్ట్స్ మరియు ఇతర వైద్య సేవల కోసం నేను మీకు సహాయం చేస్తాను."
  },
  kn: {
    greeting: "ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ CuraBot ಸಹಾಯಕ. ಇಂದು ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?",
    appointment: "ನೀವು ನಮ್ಮ ಅಪಾಯಿಂಟ್ಮೆಂಟ್ಸ್ ಪುಟಕ್ಕೆ ಹೋಗಿ ಅಪಾಯಿಂಟ್ಮೆಂಟ್ ಬುಕ್ ಮಾಡಬಹುದು.",
    emergency: "🚨 ತುರ್ತು ವೈದ್ಯಕೀಯ ಸಹಾಯಕ್ಕಾಗಿ ದಯವಿಟ್ಟು ತಕ್ಷಣ ನಮ್ಮ 24/7 ತುರ್ತು ಹಾಟ್‌ಲೈನ್‌ಗೆ ಕರೆ ಮಾಡಿ.",
    thanks: "ಸ್ವಾಗತ! ಇನ್ನೇನಾದರು ಸಹಾಯ ಬೇಕೆ?",
    default: "ಅಪಾಯಿಂಟ್ಮೆಂಟ್‌ಗಳು, ವೈದ್ಯರನ್ನು ಹುಡುಕುವುದು, ವರದಿಗಳನ್ನು ಪ್ರವೇಶಿಸುವುದು ಮತ್ತು ಇತರ ವೈದ್ಯಕೀಯ ಸೇವೆಗಳಲ್ಲಿ ನಾನು ಸಹಾಯ ಮಾಡುತ್ತೇನೆ."
  },
  ta: {
    greeting: "வணக்கம்! நான் உங்கள் CuraBot உதவியாளர். இன்று நான் எப்படி உதவலாம்?",
    appointment: "நீங்கள் எங்கள் நேர்முகப் பதிவு பக்கத்துக்குச் சென்று பதிவு செய்யலாம்.",
    emergency: "🚨 அவசர மருத்துவ உதவிக்காக உடனே எங்கள் 24/7 அவசர உதவி எணுக்கு அழைக்கவும்.",
    thanks: "வரவேற்கிறேன்! இன்னும் ஏதேனும் உதவி வேண்டுமா?",
    default: "நேர்முகங்கள், மருத்துவர்களைப் பறைசாற்றுதல், அறிக்கைகளைப் பெறுதல் மற்றும் பிற மருத்துவ சேவைகளுக்கு நான் உதவுகிறேன்."
  },
  ml: {
    greeting: "നമസ്കാരം! ഞാൻ നിങ്ങളുടെ CuraBot സഹായി. ഇന്ന് ഞാൻ എങ്ങനെ സഹായിക്കാം?",
    appointment: "നിങ്ങൾ ഞങ്ങളുടെ അപ്പോയിന്റ്മെന്റ് പേജിൽ പോയി ബുക്ക് ചെയ്യാം.",
    emergency: "🚨 അടിയന്തര മെഡിക്കൽ സഹായത്തിനായി ഉടൻ തന്നെ ഞങ്ങളുടെ 24/7 എമർജൻസി ഹോട്ട്ലൈനിലേക്ക് വിളിക്കുക.",
    thanks: "സ്വാഗതം! വേറെ എന്തെങ്കിലും സഹായം വേണോ?",
    default: "അപ്പോയിന്റ്മെന്റുകൾ, ഡോക്ടർമാരെ കണ്ടെത്തൽ, റിപ്പോർട്ടുകൾ ലഭിക്കൽ എന്നിവയിൽ ഞാൻ സഹായിക്കും."
  },
  gu: {
    greeting: "નમસ્તે! હું તમારો CuraBot સહાયક છું. આજે હું તમને કેવી રીતે મદદ કરી શકું?",
    appointment: "તમે અમારી અપોઇન્ટમેન્ટ્સ પેજ પર જઈને અપોઇન્ટમેન્ટ બુક કરી શકો છો.",
    emergency: "🚨 તાત્કાલિક તબીબી મદદ માટે કૃપા કરીને તરત જ અમારી 24/7 ઇમર્જન્સી હોટલાઇન પર કોલ કરો.",
    thanks: "આપનું સ્વાગત છે! બીજું કંઈ મદદ જોઈએ?",
    default: "અપોઇન્ટમેન્ટ, ડૉક્ટર શોધ, રિપોર્ટ્સ અને અન્ય તબીબી સેવાઓ માટે હું મદદ કરીશ."
  },
  mr: {
    greeting: "नमस्कार! मी तुमचा CuraBot सहाय्यक आहे. आज मी कशी मदत करू शकतो?",
    appointment: "आपण आमच्या अपॉइंटमेंट्स पृष्ठावर जाऊन अपॉइंटमेंट बुक करू शकता.",
    emergency: "🚨 तात्काळ वैद्यकीय मदतीसाठी कृपया लगेच आमच्या 24/7 आपत्कालीन हॉटलाइनवर कॉल करा.",
    thanks: "आपलं स्वागत आहे! आणखी काही मदत हवी आहे का?",
    default: "अपॉइंटमेंट, डॉक्टर शोध, रिपोर्ट्स आणि इतर वैद्यकीय सेवांसाठी मी मदत करेन."
  },
  bn: {
    greeting: "নমস্কার! আমি আপনার CuraBot সহকারী। আজ আমি কীভাবে সাহায্য করতে পারি?",
    appointment: "আপনি আমাদের অ্যাপয়েন্টমেন্ট পেজে গিয়ে অ্যাপয়েন্টমেন্ট বুক করতে পারেন।",
    emergency: "🚨 জরুরি চিকিৎসার জন্য অনুগ্রহ করে সাথে সাথে আমাদের 24/7 ইমার্জেন্সি হটলাইনে কল করুন।",
    thanks: "স্বাগতম! আর কিছু সাহায্য লাগবে কি?",
    default: "অ্যাপয়েন্টমেন্ট, ডাক্তার খোঁজা, রিপোর্টস এবং অন্যান্য চিকিৎসা পরিষেবায় আমি সাহায্য করব।"
  },
  pa: {
    greeting: "ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਤੁਹਾਡਾ CuraBot ਸਹਾਇਕ ਹਾਂ। ਅੱਜ ਮੈਂ ਤੁਹਾਡੀ ਕਿਵੇਂ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ?",
    appointment: "ਤੁਸੀਂ ਸਾਡੇ ਅਪਾਇੰਟਮੈਂਟ ਪੇਜ ਤੇ ਜਾ ਕੇ ਅਪਾਇੰਟਮੈਂਟ ਬੁੱਕ ਕਰ ਸਕਦੇ ਹੋ।",
    emergency: "🚨 ਤੁਰੰਤ ਮੈਡੀਕਲ ਮਦਦ ਲਈ ਕਿਰਪਾ ਕਰਕੇ ਤੁਰੰਤ ਸਾਡੀ 24/7 ਐਮਰਜੈਂਸੀ ਹਾਟਲਾਈਨ ਤੇ ਕਾਲ ਕਰੋ।",
    thanks: "ਜੀ ਆਇਆਂ ਨੂੰ! ਹੋਰ ਕੋਈ ਮਦਦ ਚਾਹੀਦੀ ਹੈ?",
    default: "ਅਪਾਇੰਟਮੈਂਟ, ਡਾਕਟਰ ਲੱਭਣਾ, ਰਿਪੋਰਟਸ ਅਤੇ ਹੋਰ ਮੈਡੀਕਲ ਸੇਵਾਵਾਂ ਲਈ ਮੈਂ ਮਦਦ ਕਰਾਂਗਾ।"
  }
};

export interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  language?: string;
  liked?: boolean;
  disliked?: boolean;
}

export interface AIResponse {
  message: string;
  confidence: number;
  source: 'ai' | 'knowledge_base' | 'fallback';
  suggestions?: string[];
}

export class AIChatService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;
  private currentLanguage: string = 'en';
  private initialized: boolean = false;
  private speechSynthesis: SpeechSynthesis | null = null;
  private speechRecognition: any = null;
  private voices: SpeechSynthesisVoice[] = [];
  private voicesReady: boolean = false;
  private quotaExceeded: boolean = false;
  private lastQuotaCheck: number = 0;
  private requestCount: number = 0;
  private dailyLimit: number = 30; // More conservative limit to prevent quota exhaustion

  constructor(apiKey?: string) {
    if (apiKey) {
      this.initializeGemini(apiKey);
    }
    this.initializeSpeech();
  }

  private async initializeGemini(providedApiKey?: string): Promise<void> {
    try {
      const apiKey = providedApiKey || import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        console.warn('GEMINI API key not found. AI features will use fallback responses.');
        return;
      }

      this.genAI = new GoogleGenerativeAI(apiKey);
      // Try multiple model options in case some are unavailable
      const modelOptions = [
        'gemini-1.5-flash-latest',
        'gemini-1.5-flash',
        'gemini-1.5-pro',
        'gemini-pro'
      ];

      let modelError: any = null;
      for (const modelName of modelOptions) {
        try {
          this.model = this.genAI.getGenerativeModel({
            model: modelName,
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 1024,
            }
          });
          console.log(`Successfully initialized with model: ${modelName}`);
          this.initialized = true;
          return;
        } catch (error) {
          modelError = error;
          console.warn(`Failed to initialize with model ${modelName}:`, error);
        }
      }

      // If all models fail, throw the last error
      throw modelError || new Error('All model options failed');
    } catch (error) {
      console.error('Failed to initialize Gemini AI:', error);
      this.initialized = false;
    }
  }

  private initializeSpeech() {
    // Initialize Speech Synthesis
    if ('speechSynthesis' in window) {
      this.speechSynthesis = window.speechSynthesis;
      // Load voices (async on some browsers)
      const loadVoices = () => {
        if (!this.speechSynthesis) return;
        const vs = this.speechSynthesis.getVoices();
        if (vs && vs.length) {
          this.voices = vs;
          this.voicesReady = true;
        }
      };
      loadVoices();
      if (typeof window !== 'undefined' && 'onvoiceschanged' in window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = () => {
          loadVoices();
        };
      }
    }

    // Initialize Speech Recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      this.speechRecognition = new SpeechRecognition();
      this.speechRecognition.continuous = false;
      this.speechRecognition.interimResults = false;
      this.speechRecognition.lang = this.getLanguageCode(this.currentLanguage);
    }
  }

  setLanguage(language: string) {
    this.currentLanguage = language;
    if (this.speechRecognition) {
      this.speechRecognition.lang = this.getLanguageCode(language);
    }
  }

  // Public method to reset quota (useful for testing or manual reset)
  resetQuota() {
    this.quotaExceeded = false;
    this.requestCount = 0;
    localStorage.removeItem('gemini_quota_reset');
    localStorage.removeItem('gemini_request_count');
    console.log('Quota manually reset');
  }

  private getLanguageCode(lang: string): string {
    const codes: { [key: string]: string } = {
      'en': 'en-US',
      'hi': 'hi-IN',
      'te': 'te-IN',
      'kn': 'kn-IN',
      'ta': 'ta-IN',
      'ml': 'ml-IN',
      'gu': 'gu-IN',
      'mr': 'mr-IN',
      'bn': 'bn-IN',
      'pa': 'pa-IN'
    };
    return codes[lang] || 'en-US';
  }

  async generateResponse(message: string): Promise<AIResponse> {
    // Check quota status first
    if (this.isQuotaExceeded()) {
      return this.getIntelligentFallbackResponse(message);
    }

    // Check if we're approaching daily limit
    if (this.requestCount >= this.dailyLimit) {
      console.log('Approaching daily quota limit, using fallback responses');
      return this.getIntelligentFallbackResponse(message);
    }

    try {
      if (!this.initialized || !this.model) {
        return this.getIntelligentFallbackResponse(message);
      }

      // Increment request count and persist to localStorage
      this.requestCount++;
      localStorage.setItem('gemini_request_count', this.requestCount.toString());
      
      // Set quota reset time if not already set (24 hours from now)
      if (!localStorage.getItem('gemini_quota_reset')) {
        const resetTime = Date.now() + (24 * 60 * 60 * 1000); // 24 hours from now
        localStorage.setItem('gemini_quota_reset', resetTime.toString());
      }
      
      const prompt = this.buildMedicalPrompt(message, this.currentLanguage);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = (response?.text?.() || '').trim();

      if (!text) {
        throw new Error('Empty AI response');
      }

      // Reset quota status on successful request
      this.quotaExceeded = false;

      return {
        message: text,
        confidence: 0.9,
        source: 'ai',
        suggestions: this.generateSuggestions(message)
      };
    } catch (error) {
      console.error('Error generating AI response:', error);
      const detail = (error as any)?.message || 'Unknown error';

      // Check for quota exceeded error
      if (detail.includes('429') || detail.includes('quota') || detail.includes('exceeded')) {
        this.quotaExceeded = true;
        this.lastQuotaCheck = Date.now();
        
        // Set quota reset time to 24 hours from now
        const resetTime = Date.now() + (24 * 60 * 60 * 1000);
        localStorage.setItem('gemini_quota_reset', resetTime.toString());
        localStorage.setItem('gemini_request_count', this.dailyLimit.toString());
        
        console.log('Quota exceeded, switching to intelligent fallback mode');
        return this.getIntelligentFallbackResponse(message);
      }

      // Check if it's a model-related error and try to reinitialize
      if (detail.includes('404') || detail.includes('not found') || detail.includes('Publisher Model')) {
        console.log('Model error detected, attempting to reinitialize with different model...');
        this.initialized = false;
        try {
          await this.initializeGemini();
          if (this.initialized && this.requestCount < this.dailyLimit) {
            // Retry the request with the new model
            return await this.generateResponse(message);
          }
        } catch (reinitError) {
          console.error('Failed to reinitialize AI service:', reinitError);
        }
      }

      // Use intelligent fallback for any other errors
      return this.getIntelligentFallbackResponse(message);
    }
  }

  private buildMedicalPrompt(userMessage: string, language: string): string {
    return `You are CuraBot, a helpful medical assistant for a hospital management system.

Guidelines:
- Provide helpful, accurate medical information
- Always recommend consulting healthcare professionals for serious concerns
- Be empathetic and supportive
- Keep responses concise but informative
- Include relevant next steps or recommendations
- Never provide specific diagnoses or treatment prescriptions

Context: This is a hospital chatbot helping patients with:
- Appointment booking
- Finding doctors and specialists
- Understanding symptoms and procedures
- Accessing medical reports
- General healthcare guidance

Language requirement:
- Respond ONLY in the language matching the locale code "${language}" (for example en, hi, te, kn, ta, ml, gu, mr, bn, pa). Do not include any translation to other languages.

User message:
"""
${userMessage}
"""

Respond in a helpful, professional, and caring manner. If the query is about emergencies, emphasize seeking immediate medical attention.`;
  }

  // Multimodal image analysis
  async generateResponseWithImage(message: string, imageDataUrl: string): Promise<AIResponse> {
    try {
      if (!this.initialized || !this.model) {
        throw new Error('AI not initialized. Please configure VITE_GEMINI_API_KEY and reload.');
      }

      const match = imageDataUrl.match(/^data:(.*?);base64,(.*)$/);
      if (!match) throw new Error('Invalid image data');
      const mimeType = match[1];
      const base64Data = match[2];

      const prompt = this.buildImagePrompt(message, this.currentLanguage);

      const result = await this.model.generateContent([
        { text: prompt },
        { inlineData: { mimeType, data: base64Data } } as any,
      ] as any);

      const response = await result.response;
      const text = (response?.text?.() || '').trim();
      if (!text) throw new Error('Empty AI response');

      return {
        message: text,
        confidence: 0.9,
        source: 'ai',
        suggestions: this.generateSuggestions(message),
      };
    } catch (error) {
      console.error('Error generating AI response with image (AI-only mode):', error);
      const detail = (error as any)?.message || 'Unknown error';

      // Check if it's a model-related error and try to reinitialize
      if (detail.includes('404') || detail.includes('not found') || detail.includes('Publisher Model')) {
        console.log('Model error detected, attempting to reinitialize with different model...');
        this.initialized = false;
        try {
          await this.initializeGemini();
          if (this.initialized) {
            // Retry the request with the new model
            return await this.generateResponseWithImage(message, imageDataUrl);
          }
        } catch (reinitError) {
          console.error('Failed to reinitialize AI service:', reinitError);
        }
      }

      const baseMsg = 'AI image analysis is unavailable right now. Please try again later.';
      const messageOut = (import.meta as any)?.env?.DEV ? `${baseMsg} Details: ${detail}` : baseMsg;
      return {
        message: messageOut,
        confidence: 0.0,
        source: 'fallback',
        suggestions: ['Retry', 'Try different image', 'Try again later'],
      };
    }
  }

  private buildImagePrompt(userMessage: string, language: string): string {
    return `You are CuraBot, a helpful medical assistant. The user has provided an image related to a health concern.

Respond ONLY in language code "${language}". Analyze the image carefully and output EXACTLY these sections with concise bullet points:

Findings:
- ...

Possible causes:
- ...

Red flags:
- ...

Care tips:
- ...

When to seek care:
- ...

Rules:
- Do not provide a medical diagnosis or prescriptions.
- Be empathetic and practical.

User context: ${userMessage || '(no text provided)'}
`;
  }

  private checkMedicalKnowledgeBase(message: string): AIResponse | null {
    const lowerMessage = message.toLowerCase();
    
    // Check symptoms
    for (const [symptom, info] of Object.entries(MEDICAL_KNOWLEDGE_BASE.symptoms)) {
      if (lowerMessage.includes(symptom.toLowerCase()) || 
          lowerMessage.includes(symptom.replace(/([A-Z])/g, ' $1').toLowerCase().trim())) {
        return {
          message: `Regarding ${symptom}: ${info.description}. 
        
Common causes include: ${info.commonCauses.join(', ')}.

${info.whenToSeek}

Home remedies that may help: ${info.homeRemedies.join(', ')}.

Would you like me to help you schedule an appointment with a relevant specialist?`,
          confidence: 0.8,
          source: 'knowledge_base',
          suggestions: ['Book appointment', 'Learn more', 'Emergency help']
        };
      }
    }

    // Check procedures
    for (const [procedure, info] of Object.entries(MEDICAL_KNOWLEDGE_BASE.procedures)) {
      if (lowerMessage.includes(procedure.toLowerCase()) || 
          lowerMessage.includes(procedure.replace(/([A-Z])/g, ' $1').toLowerCase().trim())) {
        return {
          message: `About ${procedure}: ${info.description}

Preparation: ${info.preparation.join(', ')}.
Duration: ${info.duration}
Results: ${info.results}

Would you like me to help you schedule this procedure?`,
          confidence: 0.8,
          source: 'knowledge_base',
          suggestions: ['Schedule procedure', 'More info', 'Preparation tips']
        };
      }
    }

    return null;
  }

  private isQuotaExceeded(): boolean {
    // Check if we have a stored quota reset time
    const storedQuotaReset = localStorage.getItem('gemini_quota_reset');
    const storedRequestCount = localStorage.getItem('gemini_request_count');
    
    if (storedQuotaReset && storedRequestCount) {
      const resetTime = parseInt(storedQuotaReset);
      const currentCount = parseInt(storedRequestCount);
      
      // If we're past the reset time, clear the quota
      if (Date.now() > resetTime) {
        this.quotaExceeded = false;
        this.requestCount = 0;
        localStorage.removeItem('gemini_quota_reset');
        localStorage.removeItem('gemini_request_count');
        return false;
      }
      
      // Update our internal state from localStorage
      this.requestCount = currentCount;
      if (currentCount >= this.dailyLimit) {
        this.quotaExceeded = true;
        return true;
      }
    }
    
    if (!this.quotaExceeded) return false;
    
    // Reset quota status after 24 hours
    const hoursSinceQuotaCheck = (Date.now() - this.lastQuotaCheck) / (1000 * 60 * 60);
    if (hoursSinceQuotaCheck >= 24) {
      this.quotaExceeded = false;
      this.requestCount = 0;
      localStorage.removeItem('gemini_quota_reset');
      localStorage.removeItem('gemini_request_count');
      return false;
    }
    
    return true;
  }

  private getIntelligentFallbackResponse(message: string): AIResponse {
    // First, try medical knowledge base
    const knowledgeResponse = this.checkMedicalKnowledgeBase(message);
    if (knowledgeResponse) {
      return knowledgeResponse;
    }

    // Then try pattern-based responses
    const patternResponse = this.getPatternBasedResponse(message);
    if (patternResponse) {
      return patternResponse;
    }

    // Finally, use general fallback
    return this.getFallbackResponse(message);
  }

  private getPatternBasedResponse(message: string): AIResponse | null {
    const lowerMessage = message.toLowerCase();

    // Emergency keywords
    const emergencyKeywords = ['emergency', 'urgent', 'chest pain', 'heart attack', 'stroke', 'bleeding', 'unconscious', 'accident', 'severe pain'];
    if (emergencyKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return {
        message: `🚨 EMERGENCY ALERT: If this is a medical emergency, please call emergency services immediately (911 or your local emergency number) or go to the nearest emergency room.\n\nFor non-emergency urgent care, you can:\n• Call our 24/7 medical helpline\n• Visit our urgent care center\n• Book an emergency appointment\n\nYour safety is our priority. Don't hesitate to seek immediate help if needed.`,
        confidence: 0.95,
        source: 'knowledge_base',
        suggestions: ['Call Emergency', 'Urgent Care Info', 'Emergency Appointment']
      };
    }

    // Appointment related
    const appointmentKeywords = ['appointment', 'book', 'schedule', 'doctor', 'visit', 'consultation'];
    if (appointmentKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return {
        message: `I can help you with appointments! Here's what you can do:\n\n📅 **Book New Appointment**\n• Visit our Appointments page\n• Choose your preferred doctor and time\n• Fill in your details\n\n👨‍⚕️ **Find a Doctor**\n• Browse our specialists\n• Check doctor availability\n• Read doctor profiles\n\n📋 **Manage Existing Appointments**\n• View your upcoming appointments\n• Reschedule if needed\n• Get appointment reminders\n\nWould you like me to guide you to the appointments page?`,
        confidence: 0.9,
        source: 'knowledge_base',
        suggestions: ['Book Appointment', 'Find Doctor', 'View My Appointments']
      };
    }

    // Symptoms and health concerns
    const symptomKeywords = ['pain', 'hurt', 'ache', 'sick', 'feel', 'symptom', 'problem', 'issue', 'concern'];
    if (symptomKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return {
        message: `I understand you have health concerns. While I can provide general information, it's important to consult with a healthcare professional for proper evaluation.\n\n🩺 **For Your Symptoms:**\n• Book an appointment with a relevant specialist\n• Consider urgent care if symptoms are severe\n• Keep track of when symptoms started and their severity\n\n📋 **What You Can Do:**\n• Describe your symptoms to a doctor\n• Mention any medications you're taking\n• Note any recent changes in your health\n\n⚠️ **Seek immediate care if you experience:**\n• Severe or worsening symptoms\n• Difficulty breathing\n• Chest pain\n• High fever\n\nWould you like help finding the right specialist?`,
        confidence: 0.85,
        source: 'knowledge_base',
        suggestions: ['Find Specialist', 'Book Appointment', 'Emergency Help']
      };
    }

    // Reports and test results
    const reportKeywords = ['report', 'result', 'test', 'lab', 'blood', 'xray', 'scan', 'mri'];
    if (reportKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return {
        message: `I can help you with medical reports and test results!\n\n📊 **Access Your Reports:**\n• Visit the Reports section in your dashboard\n• View all your medical reports\n• Download reports as needed\n\n🔍 **Understanding Reports:**\n• Reports are generated by your doctors after appointments\n• They include diagnosis, prescriptions, and recommendations\n• You can search and filter your reports by date or type\n\n📋 **Lab Tests & Procedures:**\n• Schedule lab tests through appointments\n• Results are typically available within 24-48 hours\n• You'll be notified when results are ready\n\nWould you like me to guide you to your reports?`,
        confidence: 0.9,
        source: 'knowledge_base',
        suggestions: ['View Reports', 'Schedule Lab Test', 'Download Reports']
      };
    }

    // Insurance and billing
    const insuranceKeywords = ['insurance', 'billing', 'payment', 'cost', 'price', 'coverage', 'claim'];
    if (insuranceKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return {
        message: `I can help with insurance and billing questions!\n\n💳 **Insurance Coverage:**\n• We accept most major insurance plans\n• Verify your coverage before appointments\n• Bring your insurance card to visits\n\n💰 **Billing Information:**\n• Bills are typically sent after services\n• Payment plans may be available\n• Contact our billing department for questions\n\n📋 **For Appointments:**\n• Provide insurance information when booking\n• Check if referrals are needed\n• Understand your copay requirements\n\nFor specific billing questions, please contact our billing department directly.`,
        confidence: 0.8,
        source: 'knowledge_base',
        suggestions: ['Contact Billing', 'Insurance Info', 'Payment Options']
      };
    }

    return null;
  }

  private getQuotaStatus(): { exceeded: boolean; resetTime?: string; requestsUsed?: number } {
    const storedQuotaReset = localStorage.getItem('gemini_quota_reset');
    const storedRequestCount = localStorage.getItem('gemini_request_count');
    
    if (storedQuotaReset && storedRequestCount) {
      const resetTime = parseInt(storedQuotaReset);
      const currentCount = parseInt(storedRequestCount);
      
      if (Date.now() > resetTime) {
        return { exceeded: false };
      }
      
      const timeUntilReset = Math.ceil((resetTime - Date.now()) / (1000 * 60 * 60)); // hours
      
      return {
        exceeded: currentCount >= this.dailyLimit,
        resetTime: timeUntilReset > 1 ? `${timeUntilReset} hours` : 'less than 1 hour',
        requestsUsed: currentCount
      };
    }
    
    return { exceeded: this.quotaExceeded };
  }

  private getFallbackResponse(message: string): AIResponse {
    const lowerMessage = message.toLowerCase();
    const translations = TRANSLATIONS[this.currentLanguage as keyof typeof TRANSLATIONS] || TRANSLATIONS.en;
    const quotaStatus = this.getQuotaStatus();

    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return {
        message: `${translations.greeting}\n\n🏥 **I can help you with:**\n• Booking appointments\n• Finding doctors and specialists\n• Accessing your medical reports\n• General health information\n• Emergency guidance\n\n💡 **Quick Actions:**\n• Ask about symptoms\n• Schedule appointments\n• Find specialists\n• Get emergency help\n\nWhat would you like to know about today?`,
        confidence: 0.8,
        source: 'fallback',
        suggestions: ['Book Appointment', 'Find Doctor', 'Ask About Symptoms', 'Emergency Help']
      };
    } else if (lowerMessage.includes('appointment') || lowerMessage.includes('book')) {
      return {
        message: translations.appointment,
        confidence: 0.7,
        source: 'fallback',
        suggestions: ['Find doctors', 'Available times', 'Cancel appointment']
      };
    } else if (lowerMessage.includes('emergency')) {
      return {
        message: `🚨 ${translations.emergency}\n\n**Emergency Contacts:**\n• Emergency Services: 911\n• Hospital Emergency Room: Available 24/7\n• Poison Control: 1-800-222-1222\n\n**For Non-Emergency Urgent Care:**\n• Call our urgent care hotline\n• Visit our urgent care center\n• Book an urgent appointment online\n\nYour safety is our top priority. When in doubt, seek immediate medical attention.`,
        confidence: 0.95,
        source: 'fallback',
        suggestions: ['Call Emergency', 'Urgent Care Info', 'Emergency Room']
      };
    } else if (lowerMessage.includes('thank')) {
      return {
        message: `${translations.thanks}\n\n😊 I'm here whenever you need assistance with:\n• Medical appointments\n• Health questions\n• Finding specialists\n• Accessing reports\n• Emergency guidance\n\nFeel free to ask me anything!`,
        confidence: 0.8,
        source: 'fallback',
        suggestions: ['Book Appointment', 'Ask Question', 'Find Doctor']
      };
    }
    
    // Build status message based on quota
    let statusMessage = '';
    if (quotaStatus.exceeded && quotaStatus.resetTime) {
      statusMessage = `🤖 **AI responses temporarily limited** (resets in ${quotaStatus.resetTime}), but I can still help you with comprehensive medical assistance:\n\n`;
    } else {
      statusMessage = `🤖 **I'm here to help** with comprehensive medical assistance:\n\n`;
    }

    return {
      message: `${translations.default}\n\n${statusMessage}📅 **Appointments & Scheduling**\n• Book new appointments\n• Find available doctors\n• Manage existing appointments\n\n🏥 **Hospital Services**\n• Information about our departments\n• Specialist referrals\n• General health guidance\n\n📊 **Reports & Records**\n• Access your medical reports\n• Download test results\n• View appointment history\n\n🚨 **Emergency Support**\n• Emergency contact information\n• Urgent care guidance\n• When to seek immediate help\n\nWhat can I help you with today?`,
      confidence: 0.7,
      source: 'fallback',
      suggestions: ['Book Appointment', 'Find Doctor', 'Emergency Help', 'View Reports']
    };
  }

  private generateSuggestions(userMessage: string): string[] {
    const suggestions = [];
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('pain') || lowerMessage.includes('hurt')) {
      suggestions.push('Book appointment with specialist', 'Learn about pain management', 'Emergency contact info');
    } else if (lowerMessage.includes('test') || lowerMessage.includes('lab')) {
      suggestions.push('View lab reports', 'Schedule lab tests', 'Understand test results');
    } else if (lowerMessage.includes('doctor')) {
      suggestions.push('Find specialists', 'Book appointment', 'View doctor profiles');
    }

    return suggestions;
  }

  // Choose the best matching voice for a language code
  private chooseVoiceForLanguage(langCode: string): SpeechSynthesisVoice | null {
    if (!this.voices || !this.voices.length) return null;
    const locale = this.getLanguageCode(langCode); // e.g., 'te-IN'
    const base = langCode; // e.g., 'te'

    if (DEBUG_TTS) console.log(`[TTS] Looking for voice for language: ${langCode} (locale: ${locale})`);
    if (DEBUG_TTS) console.log(`[TTS] Available voices:`, this.voices.map(v => `${v.name} (${v.lang})`));

    // Try exact locale match first (e.g., 'te-IN')
    let voice = this.voices.find(v => v.lang.toLowerCase() === locale.toLowerCase());
    if (voice) {
      if (DEBUG_TTS) console.log(`[TTS] Found exact locale match: ${voice.name} (${voice.lang})`);
      return voice;
    }

    // Try language code match (e.g., 'te')
    voice = this.voices.find(v => v.lang.toLowerCase().startsWith(base.toLowerCase() + '-'));
    if (voice) {
      if (DEBUG_TTS) console.log(`[TTS] Found language match: ${voice.name} (${voice.lang})`);
      return voice;
    }

    // Try name-based matching for Indian languages (some browsers use names)
    const languageNames: { [key: string]: string[] } = {
      'hi': ['hindi', 'हिन्दी'],
      'te': ['telugu', 'తెలుగు'],
      'kn': ['kannada', 'ಕನ್ನಡ'],
      'ta': ['tamil', 'தமிழ்'],
      'ml': ['malayalam', 'മലയാളം'],
      'gu': ['gujarati', 'ગુજરાતી'],
      'mr': ['marathi', 'मराठी'],
      'bn': ['bengali', 'bangla', 'বাংলা'],
      'pa': ['punjabi', 'ਪੰਜਾਬੀ']
    };

    if (languageNames[base]) {
      for (const name of languageNames[base]) {
        voice = this.voices.find(v => v.name.toLowerCase().includes(name.toLowerCase()));
        if (voice) {
          if (DEBUG_TTS) console.log(`[TTS] Found name-based match: ${voice.name} (${voice.lang})`);
          return voice;
        }
      }
    }

    // For Indian languages, try Hindi as fallback before English
    if (['te', 'kn', 'ta', 'ml', 'gu', 'mr', 'bn', 'pa'].includes(base)) {
      voice = this.voices.find(v => v.lang.toLowerCase().includes('hi') || v.name.toLowerCase().includes('hindi'));
      if (voice) {
        if (DEBUG_TTS) console.log(`[TTS] Using Hindi fallback for ${base}: ${voice.name} (${voice.lang})`);
        return voice;
      }
    }

    // Final fallback to English or first available voice
    voice = this.voices.find(v => v.lang.toLowerCase().startsWith('en-')) || this.voices[0] || null;
    if (DEBUG_TTS) console.log(`[TTS] Using English fallback voice: ${voice?.name} (${voice?.lang})`);
    return voice;
  }

  // Text-to-Speech functionality with robust voice selection
  speak(text: string, language?: string): void {
    if (!this.speechSynthesis) return;
    const lang = (language || this.currentLanguage);

    const attemptSpeak = (attempt = 0) => {
      // Ensure voices are loaded
      if (!this.voicesReady || !this.voices.length) {
        if (attempt < 5) {
          setTimeout(() => attemptSpeak(attempt + 1), 300);
        }
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      const locale = this.getLanguageCode(lang);
      utterance.lang = locale;
      
      const voice = this.chooseVoiceForLanguage(lang);
      if (voice) {
        utterance.voice = voice;
        if (DEBUG_TTS) console.log(`[TTS] Speaking with voice: ${voice.name} (${voice.lang}) for language: ${lang}`);
      } else {
        if (DEBUG_TTS) console.log(`[TTS] No specific voice found for ${lang}, using system default`);
      }
      
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.9;
      
      // Add error handling
      utterance.onerror = (event) => {
        console.error(`[TTS] Speech error:`, event);
      };
      
      utterance.onstart = () => {
        if (DEBUG_TTS) console.log(`[TTS] Started speaking: "${text.substring(0, 50)}..."`);
      };
      
      this.speechSynthesis!.speak(utterance);
    };

    attemptSpeak();
  }

  stopSpeaking(): void {
    if (this.speechSynthesis) {
      this.speechSynthesis.cancel();
    }
  }

  // Speech-to-Text functionality
  startListening(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.speechRecognition) {
        reject(new Error('Speech recognition not supported'));
        return;
      }

      this.speechRecognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        resolve(transcript);
      };

      this.speechRecognition.onerror = (event: any) => {
        reject(new Error(`Speech recognition error: ${event.error}`));
      };

      this.speechRecognition.start();
    });
  }

  stopListening(): void {
    if (this.speechRecognition) {
      this.speechRecognition.stop();
    }
  }

  // Language detection
  detectLanguage(text: string): string {
    // Simple language detection based on common words
    const patterns = {
      hi: /[\u0900-\u097F]/, // Devanagari (Hindi/Marathi etc.)
      te: /[\u0C00-\u0C7F]/, // Telugu
      kn: /[\u0C80-\u0CFF]/, // Kannada
      ta: /[\u0B80-\u0BFF]/, // Tamil
      ml: /[\u0D00-\u0D7F]/, // Malayalam
      gu: /[\u0A80-\u0AFF]/, // Gujarati
      bn: /[\u0980-\u09FF]/, // Bengali
      pa: /[\u0A00-\u0A7F]/  // Gurmukhi (Punjabi)
    } as Record<string, RegExp>;

    for (const [lang, pattern] of Object.entries(patterns)) {
      if (pattern.test(text)) {
        return lang;
      }
    }

    return 'en'; // Default to English
  }

  // Get available languages
  getAvailableLanguages(): { code: string; name: string }[] {
    return [
      { code: 'en', name: 'English' },
      { code: 'hi', name: 'हिन्दी' },
      { code: 'te', name: 'తెలుగు' },
      { code: 'kn', name: 'ಕನ್ನಡ' },
      { code: 'ta', name: 'தமிழ்' },
      { code: 'ml', name: 'മലയാളം' },
      { code: 'gu', name: 'ગુજરાતી' },
      { code: 'mr', name: 'मराठी' },
      { code: 'bn', name: 'বাংলা' },
      { code: 'pa', name: 'ਪੰਜਾਬੀ' }
    ];
  }

  // Get greeting for a language
  getGreeting(lang: string): string {
    const t = (TRANSLATIONS as any)[lang] || TRANSLATIONS.en;
    return t.greeting || TRANSLATIONS.en.greeting;
  }

  // Get medical specialties
  getMedicalSpecialties(): { [key: string]: string } {
    return MEDICAL_KNOWLEDGE_BASE.specialties;
  }
}

export default AIChatService;
