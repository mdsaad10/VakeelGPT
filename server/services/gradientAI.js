const axios = require('axios');

class GradientAIService {
  constructor() {
    this.apiKey = process.env.GRADIENT_AI_API_KEY;
    this.endpoint = process.env.GRADIENT_AI_ENDPOINT;
    this.modelName = process.env.MODEL_NAME || 'deepseek-r1-distill-llama-70b';
    
    if (!this.apiKey) {
      console.warn('⚠️  Gradient AI API key not found. Using mock responses.');
    }
  }

  async generateResponse(message, context = {}) {
    const { language = 'en', messageType = 'general', userHistory = [] } = context;
    
    try {
      if (!this.apiKey) {
        return this.getMockResponse(message, language, messageType);
      }

      const prompt = this.buildPrompt(message, language, messageType, userHistory);
      
      const response = await axios.post(
        `${this.endpoint}/chat/completions`,
        {
          model: this.modelName,
          messages: [
            {
              role: 'system',
              content: this.getSystemPrompt(language)
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1500,
          temperature: 0.7,
          top_p: 0.9
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      return response.data.choices[0].message.content.trim();
      
    } catch (error) {
      console.error('Gradient AI API Error:', error.response?.data || error.message);
      return this.getErrorResponse(language);
    }
  }

  getSystemPrompt(language) {
    const prompts = {
      en: `You are VakeelGPT, an expert Indian legal AI assistant. You provide accurate, helpful legal information in simple terms. 

Key Guidelines:
- Always clarify that you provide general legal information, not legal advice
- Reference relevant Indian laws (IPC, CrPC, CPC, Constitution, etc.)
- Explain complex legal concepts in simple language
- Suggest consulting a qualified lawyer for specific cases
- Be culturally sensitive to Indian legal practices
- Support document drafting with standard Indian legal formats`,

      hi: `आप VakeelGPT हैं, एक विशेषज्ञ भारतीय कानूनी AI सहायक। आप सटीक, उपयोगी कानूनी जानकारी सरल शब्दों में प्रदान करते हैं।

मुख्य दिशानिर्देश:
- हमेशा स्पष्ट करें कि आप सामान्य कानूनी जानकारी प्रदान करते हैं, कानूनी सलाह नहीं
- प्रासंगिक भारतीय कानूनों का संदर्भ दें (IPC, CrPC, CPC, संविधान, आदि)
- जटिल कानूनी अवधारणाओं को सरल भाषा में समझाएं
- विशिष्ट मामलों के लिए योग्य वकील से सलाह लेने का सुझाव दें`,

      ta: `நீங்கள் VakeelGPT, ஒரு நிபுணத்துவம் வாய்ந்த இந்திய சட்ட AI உதவியாளர். நீங்கள் துல்லியமான, பயனுள்ள சட்ட தகவல்களை எளிய சொற்களில் வழங்குகிறீர்கள்।`,

      te: `మీరు VakeelGPT, ఒక నిపుణుడైన భారతీయ న్యాయ AI సహాయకుడు. మీరు ఖచ్చితమైన, ఉపయోగకరమైన న్యాయ సమాచారాన్ని సాధారణ పదాలలో అందిస్తారు।`,

      bn: `আপনি VakeelGPT, একজন বিশেষজ্ঞ ভারতীয় আইনি AI সহায়ক। আপনি নির্ভুল, সহায়ক আইনি তথ্য সহজ ভাষায় প্রদান করেন।`
    };

    return prompts[language] || prompts.en;
  }

  buildPrompt(message, language, messageType, userHistory) {
    let prompt = message;

    if (messageType === 'document_draft') {
      prompt = `Please help me draft a legal document. User request: ${message}

Please provide a properly formatted document with:
1. Appropriate legal structure
2. Standard clauses relevant to Indian law
3. Placeholder fields marked with [PLACEHOLDER]
4. Clear sections and subsections`;
    }

    if (userHistory.length > 0) {
      const recentHistory = userHistory.slice(-3).map(h => 
        `User: ${h.message}\nAssistant: ${h.response}`
      ).join('\n\n');
      
      prompt += `\n\nPrevious conversation context:\n${recentHistory}`;
    }

    return prompt;
  }

  getMockResponse(message, language, messageType) {
    const mockResponses = {
      en: {
        general: "I understand you're asking about Indian legal matters. While I'd love to provide specific guidance, I recommend consulting with a qualified lawyer for personalized advice. For general information, you can refer to Indian legal resources or contact your local legal aid center.",
        document_draft: "Here's a basic template for your legal document. Please note that this is a general format and should be reviewed by a legal professional:\n\n[DOCUMENT TEMPLATE]\n\nThis document is created on [DATE] between [PARTY 1] and [PARTY 2].\n\n[Standard legal clauses would appear here]\n\nPlease consult a lawyer to customize this document for your specific needs."
      },
      hi: {
        general: "मैं समझता हूं कि आप भारतीय कानूनी मामलों के बारे में पूछ रहे हैं। जबकि मैं विशिष्ट मार्गदर्शन प्रदान करना चाहूंगा, मैं व्यक्तिगत सलाह के लिए एक योग्य वकील से सलाह लेने की सलाह देता हूं।",
        document_draft: "यहां आपके कानूनी दस्तावेज़ के लिए एक बुनियादी टेम्प्लेट है। कृपया ध्यान दें कि यह एक सामान्य प्रारूप है और इसकी समीक्षा एक कानूनी पेशेवर द्वारा की जानी चाहिए।"
      }
    };

    const langResponses = mockResponses[language] || mockResponses.en;
    return langResponses[messageType] || langResponses.general;
  }

  getErrorResponse(language) {
    const errorResponses = {
      en: "I'm experiencing technical difficulties. Please try again in a moment or contact support if the issue persists.",
      hi: "मुझे तकनीकी कठिनाइयों का सामना करना पड़ रहा है। कृपया एक क्षण में फिर से कोशिश करें।",
      ta: "எனக்கு தொழில்நுட்ப சிக்கல்கள் உள்ளன. தயவுசெய்து சற்று நேரத்தில் மீண்டும் முயற்சிக்கவும்.",
      te: "నాకు సాంకేతిక ఇబ్బందులు ఉన్నాయి. దయచేసి ఒక క్షణంలో మళ్ళీ ప్రయత్నించండి.",
      bn: "আমার প্রযুক্তিগত সমস্যা হচ্ছে। দয়া করে একটু পরে আবার চেষ্টা করুন।"
    };

    return errorResponses[language] || errorResponses.en;
  }

  async generateDocumentTemplate(documentType, language = 'en', customFields = {}) {
    const templates = {
      'rent_agreement': {
        en: `RENTAL AGREEMENT

This Rental Agreement is made on [DATE] between:

LANDLORD: [LANDLORD_NAME]
Address: [LANDLORD_ADDRESS]

TENANT: [TENANT_NAME]  
Address: [TENANT_ADDRESS]

PROPERTY DETAILS:
Address: [PROPERTY_ADDRESS]
Type: [PROPERTY_TYPE]
Area: [PROPERTY_AREA]

TERMS AND CONDITIONS:

1. RENT: Rs. [MONTHLY_RENT] per month
2. SECURITY DEPOSIT: Rs. [SECURITY_DEPOSIT]
3. LEASE PERIOD: [LEASE_DURATION] months
4. MAINTENANCE: [MAINTENANCE_CLAUSE]

Both parties agree to the above terms and conditions.

Landlord Signature: ________________
Tenant Signature: ________________

Note: This is a basic template. Please consult a lawyer for comprehensive drafting.`,
        hi: `किराया समझौता

यह किराया समझौता [DATE] को निम्नलिखित के बीच किया गया है:

मकान मालिक: [LANDLORD_NAME]
पता: [LANDLORD_ADDRESS]

किरायेदार: [TENANT_NAME]
पता: [TENANT_ADDRESS]

संपत्ति का विवरण:
पता: [PROPERTY_ADDRESS]
प्रकार: [PROPERTY_TYPE]

नियम और शर्तें:
1. किराया: रु. [MONTHLY_RENT] प्रति माह
2. सिक्यूरिटी डिपॉजिट: रु. [SECURITY_DEPOSIT]

कृपया व्यापक मसौदा तैयार करने के लिए एक वकील से सलाह लें।`
      },
      'nda': {
        en: `NON-DISCLOSURE AGREEMENT (NDA)

This Agreement is entered into on [DATE] between:

DISCLOSING PARTY: [COMPANY_NAME]
RECEIVING PARTY: [RECIPIENT_NAME]

1. CONFIDENTIAL INFORMATION
The Receiving Party acknowledges that confidential information includes [CONFIDENTIAL_INFO_DESCRIPTION].

2. OBLIGATIONS
The Receiving Party agrees to:
- Maintain strict confidentiality
- Use information solely for [PURPOSE]
- Not disclose to third parties

3. TERM: This agreement remains in effect for [DURATION] years.

4. GOVERNING LAW: This agreement is governed by Indian law.

Disclosing Party: ________________
Receiving Party: ________________

Please consult a legal professional for complete NDA drafting.`
      }
    };

    const template = templates[documentType]?.[language] || templates[documentType]?.en;
    
    if (!template) {
      return "Document template not available. Please specify a valid document type (rent_agreement, nda, etc.)";
    }

    // Replace custom fields if provided
    let finalTemplate = template;
    Object.keys(customFields).forEach(key => {
      const placeholder = `[${key.toUpperCase()}]`;
      finalTemplate = finalTemplate.replace(new RegExp(placeholder, 'g'), customFields[key]);
    });

    return finalTemplate;
  }
}

module.exports = new GradientAIService();