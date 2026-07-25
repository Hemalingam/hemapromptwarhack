/**
 * Core GenAI Engine & RAG-Grounded Clinical Knowledge System
 * 
 * Safety & Compliance Guardrails:
 * 1. Crisis detection ALWAYS surfaces human escalation (988 Lifeline / 14446 Tele-MANAS India).
 * 2. Strict restriction: NO AI-generated dosage or drug-use instructions.
 * 3. Stigma-aware, non-judgmental recovery language enforced at prompt template level.
 * 4. Grounded in vetted clinical evidence (SAMHSA, NIMHANS, WHO, SMART Recovery).
 */

const VETTED_CLINICAL_CORPUS = {
  mat: `Medication-Assisted Treatment (MAT) combines FDA/WHO-approved medications (like Buprenorphine, Methadone, or Naltrexone) with counseling and behavioral therapies. MAT normalizes brain chemistry, blocks euphoric effects, and relieves physiological cravings. It is a proven, evidence-based medical treatment, not "substituting one addiction for another." Always consult a qualified addiction psychiatrist or medical practitioner for specific medical evaluation and prescriptions.`,
  craving_science: `Cravings are intense neurochemical surges triggered by environmental cues, stress, or emotional states. They typically peak within 10 to 15 minutes and naturally decline. Techniques like "Craving Surfing" (visualizing the urge as an ocean wave to ride out) and diaphragmatic breathing interrupt the automatic response loop in the amygdala.`,
  caregiver_first90: `During the first 90 days of recovery, emotional volatility, sleep disturbances, and intense mood shifts are common as neurotransmitters rebalance. Caregivers should focus on non-judgmental listening, establishing clear financial/safety boundaries, avoiding enabling behavior, and encouraging professional therapy or 12-step/SMART support.`,
  relapse_learning: `Relapse or lapse is a common feature of chronic recovery, not a moral failure or reset to zero. Neural pathways formed during recovery remain. The primary goal after a lapse is rapid safety reconnection, identifying the immediate trigger, and resuming support without self-shame.`,
  naloxone: `Naloxone (brand names Narcan, Kloxxado) is an opioid antagonist medication that rapidly reverses an opioid overdose. It works by binding to opioid receptors in the brain, displacing the opioid and restoring normal breathing within 2 to 3 minutes. It is non-addictive, has no effect on someone who does not have opioids in their system, and can be administered via nasal spray or intramuscular injection.`,
  buprenorphine: `Buprenorphine is an FDA-approved partial opioid agonist used to treat Opioid Use Disorder (OUD). Because it is a partial agonist, it binds to opioid receptors to relieve withdrawal symptoms and cravings, but has a "ceiling effect" that prevents full euphoria, making it safer and significantly lowering the risk of overdose compared to full agonists.`,
  methadone: `Methadone is a long-acting full opioid agonist used for decades to treat Opioid Use Disorder. It mitigates withdrawal and blocks cravings without creating a rapid "high" when taken as prescribed. It must be dispensed through certified Opioid Treatment Programs (OTPs) and requires strict clinical supervision.`,
  side_effects: `Common side effects for MAT medications can include nausea, constipation, mild headaches, or sleep disturbances during the adjustment phase. However, severe reactions (like difficulty breathing, severe dizziness, or allergic rashes) require immediate medical attention. Never adjust dosages without consulting your prescribing physician.`
};

class GenAIEngine {
  constructor() {
    this.systemGuardrails = `You are NudgeFlow AI, an empathetic, clinical-grounded recovery assistant. Safety, ethics & compliance guardrails:
1. Crisis detection always surfaces a human escalation path — never attempt to "handle" a genuine emergency alone.
2. No AI-generated dosage or drug-use instructions, ever, regardless of framing.
3. Design for 42 CFR Part 2 and HIPAA compliance if a clinician is in the loop.
4. Ensure explicit consent flows and strict data privacy.
5. Base all answers strictly on the clinically reviewed educational corpus indexed into RAG.
6. Enforce stigma-aware, person-first language guidelines rigidly at all times.
7. ANTI-HALLUCINATION STRICT MODE: If a query cannot be answered directly from the provided clinical RAG corpus, you MUST respond EXACTLY with the phrase "[GUARDRAIL_BLOCKED]" and nothing else. Never guess, infer, or hallucinate medical or recovery information.`;
  }

  /**
   * Generates a zero-typing micro-intervention response based on selected emotion/craving level.
   */
  generateMicroIntervention(emotion, intensity, customPrompt = '') {
    const intensityNum = parseInt(intensity) || 5;

    // Strict Guardrail Check for Severe Crisis
    if (intensityNum >= 9 || customPrompt.toLowerCase().includes('die') || customPrompt.toLowerCase().includes('suicide')) {
      return {
        text: `🚨 **Immediate Safety Priority**\n\nI hear how painful and overwhelming this moment is. Please pause for a second—you don't have to carry this alone.\n\n**Immediate Step:** Tap the SOS button at the top right or connect directly with a trained counselor right now:\n• **India Tele-MANAS National Helpline:** 14446 or 1800 891 4416\n• **Suicide & Crisis Lifeline:** 988\n\nLet's slow your breathing down together right now. Press the Guided Breathing button below.`,
        isCrisis: true,
        actionType: 'SOS'
      };
    }

    if (emotion.includes('Craving') || intensityNum >= 8) {
      return {
        text: `🌊 **Craving Emergency Protocol (Level ${intensityNum})**\n\n1. **Acknowledge the surge:** This urge is a temporary neurochemical wave. It will peak and fall within 10-15 minutes.\n2. **Physical Reset:** Unclench your jaw, drop your shoulders, and place one hand over your abdomen.\n3. **Zero-Typing Action:** Tap "Guided Breathing" below to ride this wave out together. You are safe in this body right now.`,
        isCrisis: false,
        actionType: 'BREATHING'
      };
    }

    if (emotion.includes('Panic') || emotion.includes('Anxiety')) {
      return {
        text: `🌬️ **De-escalation & Grounding (Level ${intensityNum})**\n\nYour nervous system is in fight-or-flight right now. We are going to slow down your heart rate:\n\n• **Exhale longer than you inhale:** Take a soft 4-second breath in, then a long 7-second exhale.\n• **Anchor your sight:** Look around your room right now. Tap 5 objects you can see using our 5-4-3-2-1 Grounding tool below.`,
        isCrisis: false,
        actionType: 'GROUNDING'
      };
    }

    // Default supportive intervention
    return {
      text: `🌱 **30-Second Recovery Reset (${emotion})**\n\nYou noticed this feeling before it overwhelmed you. That self-awareness is a major recovery milestone.\n\n**Quick Step:** Take three deep diaphragmatic breaths, sip a glass of water, and log this moment in your Voice Journal to clear your mind.`,
      isCrisis: false,
      actionType: 'JOURNAL'
    };
  }

  /**
   * RAG-Grounded Clinical Chatbot Answer Generator
   */
  async answerClinicalQuery(query) {
    const q = query.toLowerCase();
    const apiKey = 'AQ.Ab8RN6IKntPtdGGn9rNDRcw2-r-mRy3hXiep6N8B1r4yN6ie0w';

    // Hardcoded Crisis Guardrail
    if (q.includes('suicide') || q.includes('end my life') || q.includes('want to die') || q.includes('overdose')) {
      return `🚨 **Crisis Support Required:**\nIf you or someone you know is in immediate danger, please reach out for human help immediately:\n\n• **National Tele-MANAS Mental Health Helpline (India):** Call 14446 or 1800 891 4416 (24/7, Free)\n• **Global Crisis Lifeline:** Call or Text 988\n• **Emergency Medical Services:** Dial 112 (India) or 911\n\nTap the red SOS button at the top of the screen to open single-tap emergency options.`;
    }

    const payload = {
      system_instruction: {
        parts: [{ text: this.systemGuardrails + `\n\nClinical Corpus for Grounding:\n` + JSON.stringify(VETTED_CLINICAL_CORPUS) }]
      },
      contents: [{
        parts: [{ text: query }]
      }],
      generationConfig: {
        temperature: 0.1,
      }
    };

    let apiFailed = false;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      const data = await response.json();
      
      if (data.error) {
        console.error("Gemini API Error:", data.error.message);
        apiFailed = true; 
        return `🚨 **[API DEBUG ERROR]** Google Server says: ${data.error.message}`;
      } else if (data.candidates && data.candidates[0].content.parts[0].text) {
        let rawText = data.candidates[0].content.parts[0].text.trim();
        
        if (rawText.includes('[GUARDRAIL_BLOCKED]')) {
          if (sessionStorage.getItem('has_shown_guardrail')) {
            return `⚠️ **Guardrail Active:** I cannot answer this without vetted clinical data.`;
          } else {
            sessionStorage.setItem('has_shown_guardrail', 'true');
            return `⚠️ **Clinical Guardrail Notice:**\nI do not have clinical data in my vetted corpus to answer this specific query. To ensure your safety and prevent hallucination, I cannot guess or infer medical information. Please consult a licensed addiction specialist or medical provider.`;
          }
        }
        
        return rawText;
      } else {
         apiFailed = true;
         return `🚨 **[API DEBUG ERROR]** Unknown response structure from Gemini.`;
      }
    } catch (e) {
      console.error("Network Error connecting to Gemini:", e);
      apiFailed = true;
      return `🚨 **[NETWORK DEBUG ERROR]** Browser blocked request or disconnected. Details: ${e.message}`;
    }

    // --- FALLBACK MOCK ENGINE (Runs if Live API fails due to invalid key) ---
    if (apiFailed) {
      // Check for dosage / drug instructions restriction
      if (q.includes('dosage') || q.includes('how much mg') || q.includes('how to take') || q.includes('pill count')) {
        return `⚠️ **Clinical Guardrail Notice:**\nFor your safety, Anchor AI does not generate medical dosages or medication administration schedules. Please contact a licensed healthcare professional, medical doctor, or your prescribing clinic for dosage instructions tailored to your health profile.`;
      }

      // RAG Matching against vetted corpus
      if (q.includes('mat') || q.includes('suboxone') || q.includes('methadone') || q.includes('medication')) {
        return `📚 **Clinical Knowledge: Medication-Assisted Treatment (MAT)**\n\n${VETTED_CLINICAL_CORPUS.mat}\n\n*Source: Vetted SAMHSA & WHO Clinical Recovery Guidelines.*`;
      }

      if (q.includes('craving') || q.includes('urge') || q.includes('wave') || q.includes('science')) {
        return `🧠 **Clinical Knowledge: Science of Cravings**\n\n${VETTED_CLINICAL_CORPUS.craving_science}\n\n*Source: Evidence-Based Cognitive Behavioral Therapy & SMART Recovery.*`;
      }

      if (q.includes('caregiver') || q.includes('teen') || q.includes('family') || q.includes('90 days')) {
        return `❤️ **Caregiver Clinical Guidance: The First 90 Days**\n\n${VETTED_CLINICAL_CORPUS.caregiver_first90}\n\n*Source: Al-Anon & CRAFT (Community Reinforcement and Family Training) Clinical Framework.*`;
      }

      if (q.includes('relapse') || q.includes('lapse') || q.includes('slip')) {
        return `🔄 **Clinical Guidance: Managing Lapses & Relapse Prevention**\n\n${VETTED_CLINICAL_CORPUS.relapse_learning}\n\n*Source: Marlatt Relapse Prevention Model.*`;
      }

      if (q.includes('naloxone') || q.includes('narcan')) {
        return `🛡️ **Clinical Knowledge: Naloxone (Narcan)**\n\n${VETTED_CLINICAL_CORPUS.naloxone}\n\n*Source: CDC & SAMHSA Harm Reduction Guidelines.*`;
      }

      if (q.includes('buprenorphine') || q.includes('subutex') || q.includes('suboxone')) {
        return `💊 **Clinical Knowledge: Buprenorphine**\n\n${VETTED_CLINICAL_CORPUS.buprenorphine}\n\n*Source: FDA & SAMHSA MAT Protocols.*`;
      }

      if (q.includes('methadone')) {
        return `💊 **Clinical Knowledge: Methadone**\n\n${VETTED_CLINICAL_CORPUS.methadone}\n\n*Source: NIDA & SAMHSA MAT Protocols.*`;
      }

      if (q.includes('side effect') || q.includes('nausea') || q.includes('headache') || q.includes('feel sick')) {
        return `🩺 **Clinical Knowledge: Medication Side Effects**\n\n${VETTED_CLINICAL_CORPUS.side_effects}\n\n*Source: FDA Medical Directives.*`;
      }

      // Conversational & General Support Fallbacks
      if (q === 'hi' || q === 'hello' || q.includes('good morning') || q.includes('good evening') || q.includes('hey')) {
        return `👋 Hello! I am the NudgeFlow AI Guide. I am here to provide vetted educational information on recovery, medications, and coping strategies. How can I support you today?`;
      }

      if (q.includes('who are you') || q.includes('what can you do') || q.includes('how do you work')) {
        return `🤖 **About Me:**\nI am a clinical support AI trained exclusively on vetted guidelines from SAMHSA, WHO, and the FDA. \n\nYou can ask me about:\n• Medications (MAT, Buprenorphine, Methadone)\n• Harm Reduction (Naloxone/Narcan)\n• Coping with cravings & anxiety\n• Caregiver support\n\n*Note: I cannot provide medical diagnoses or dosage instructions.*`;
      }

      if (q.includes('thank you') || q.includes('thanks')) {
        return `💙 You're very welcome. Remember, taking things one day at a time is enough. I'm always here if you have more questions.`;
      }

      if (q.includes('sad') || q.includes('depressed') || q.includes('lonely') || q.includes('tired')) {
        return `🌱 **I hear you.**\nRecovery can be emotionally exhausting. It is completely normal to feel this way as your brain and body heal. \n\nConsider trying the "Guided Breathing" tool or visiting the "Peer Support" tab to connect with others who understand exactly what you are going through.`;
      }

      // Fallback general clinical response - STRICT ANTI-HALLUCINATION ENFORCEMENT
      if (sessionStorage.getItem('has_shown_guardrail')) {
        return `⚠️ **Guardrail Active:** I cannot answer this without vetted clinical data.`;
      } else {
        sessionStorage.setItem('has_shown_guardrail', 'true');
        return `⚠️ **Clinical Guardrail Notice:**\nI do not have clinical data in my vetted corpus to answer this specific query. To ensure your safety and prevent hallucination, I cannot guess or infer medical information. Please consult a licensed addiction specialist or medical provider.`;
      }
    }

    if (q.includes('side effect') || q.includes('nausea') || q.includes('headache') || q.includes('feel sick')) {
      return `🩺 **Clinical Knowledge: Medication Side Effects**\n\n${VETTED_CLINICAL_CORPUS.side_effects}\n\n*Source: FDA Medical Directives.*`;
    }

    // Conversational & General Support Fallbacks
    if (q === 'hi' || q === 'hello' || q.includes('good morning') || q.includes('good evening') || q.includes('hey')) {
      return `👋 Hello! I am the NudgeFlow AI Guide. I am here to provide vetted educational information on recovery, medications, and coping strategies. How can I support you today?`;
    }

    if (q.includes('who are you') || q.includes('what can you do') || q.includes('how do you work')) {
      return `🤖 **About Me:**\nI am a clinical support AI trained exclusively on vetted guidelines from SAMHSA, WHO, and the FDA. \n\nYou can ask me about:\n• Medications (MAT, Buprenorphine, Methadone)\n• Harm Reduction (Naloxone/Narcan)\n• Coping with cravings & anxiety\n• Caregiver support\n\n*Note: I cannot provide medical diagnoses or dosage instructions.*`;
    }

    if (q.includes('thank you') || q.includes('thanks')) {
      return `💙 You're very welcome. Remember, taking things one day at a time is enough. I'm always here if you have more questions.`;
    }

    if (q.includes('sad') || q.includes('depressed') || q.includes('lonely') || q.includes('tired')) {
      return `🌱 **I hear you.**\nRecovery can be emotionally exhausting. It is completely normal to feel this way as your brain and body heal. \n\nConsider trying the "Guided Breathing" tool or visiting the "Peer Support" tab to connect with others who understand exactly what you are going through.`;
    }

    // Fallback general clinical response - STRICT ANTI-HALLUCINATION ENFORCEMENT
    if (sessionStorage.getItem('has_shown_guardrail')) {
      return `⚠️ **Guardrail Active:** I cannot answer this without vetted clinical data.`;
    } else {
      sessionStorage.setItem('has_shown_guardrail', 'true');
      return `⚠️ **Clinical Guardrail Notice:**\nI do not have clinical data in my vetted corpus to answer this specific query. To ensure your safety and prevent hallucination, I cannot guess or infer medical information. Please consult a licensed addiction specialist or medical provider.`;
    }
  }
}

window.genAiEngine = new GenAIEngine();

// Export for Jest testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { GenAIEngine, VETTED_CLINICAL_CORPUS };
}
