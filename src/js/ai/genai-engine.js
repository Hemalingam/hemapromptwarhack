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
  relapse_learning: `Relapse or lapse is a common feature of chronic recovery, not a moral failure or reset to zero. Neural pathways formed during recovery remain. The primary goal after a lapse is rapid safety reconnection, identifying the immediate trigger, and resuming support without self-shame.`
};

class GenAIEngine {
  constructor() {
    this.systemGuardrails = `You are NudgeFlow AI, an empathetic, clinical-grounded recovery assistant. Rules:
1. NEVER provide drug dosages, administration instructions, or medical diagnoses.
2. If crisis/suicidal intent is detected, prioritize immediate helpline escalation (988 or 14446).
3. Use person-first, stigma-aware language (e.g., "individual navigating substance use" rather than stigmatizing labels).`;
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
  answerClinicalQuery(query) {
    const q = query.toLowerCase();

    // Check for dosage / drug instructions restriction
    if (q.includes('dosage') || q.includes('how much mg') || q.includes('how to take') || q.includes('pill count')) {
      return `⚠️ **Clinical Guardrail Notice:**\nFor your safety, Anchor AI does not generate medical dosages or medication administration schedules. Please contact a licensed healthcare professional, medical doctor, or your prescribing clinic for dosage instructions tailored to your health profile.`;
    }

    // Check for Crisis
    if (q.includes('suicide') || q.includes('end my life') || q.includes('want to die') || q.includes('overdose help')) {
      return `🚨 **Crisis Support Required:**\nIf you or someone you know is in immediate danger, please reach out for human help immediately:\n\n• **National Tele-MANAS Mental Health Helpline (India):** Call 14446 or 1800 891 4416 (24/7, Free)\n• **Global Crisis Lifeline:** Call or Text 988\n• **Emergency Medical Services:** Dial 112 (India) or 911\n\nTap the red SOS button at the top of the screen to open single-tap emergency options.`;
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

    // Fallback general clinical response
    return `💡 **Recovery Resource Answer**\n\nRecovery from substance use disorder is a gradual, non-linear neurobiological process. Key evidence-based pillars include:\n1. **Peer Connection:** Connecting regularly with others who understand the journey.\n2. **Routine & Habit Building:** Replacing substance routines with structured self-care.\n3. **Zero-Typing Micro-Tools:** Utilizing immediate breathing and grounding tools during sudden stress surges.\n\n*For specialized medical advice, always consult your physician or addiction specialist.*`;
  }
}

window.genAiEngine = new GenAIEngine();
