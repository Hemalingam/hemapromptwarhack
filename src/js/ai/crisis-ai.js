/**
 * Crisis AI & Emergency Script Personalizer
 * Generates immediate de-escalation scripts, Web Push notification alerts for caregivers,
 * and India treatment directory data.
 */

const INDIA_TREATMENT_DIRECTORY = [
  {
    name: 'National Tele-MANAS Helpline (Govt. of India)',
    type: '24/7 National Tele-Mental Health Helpline',
    phone: '14446',
    altPhone: '1800-891-4416',
    location: 'Pan-India (Available in 20+ Languages)',
    address: 'Ministry of Health and Family Welfare, Govt. of India',
    services: 'Free 24/7 crisis intervention, addiction counseling, psychiatric escalation',
    badge: 'National Helpline'
  },
  {
    name: 'NIMHANS Centre for Addiction Medicine',
    type: 'Premier Neuropsychiatry & De-Addiction Hospital',
    phone: '080-26995000',
    location: 'Bengaluru, Karnataka',
    address: 'Hosur Road, Wilson Garden, Bengaluru, Karnataka 560029',
    services: 'Inpatient detoxification, outpatient addiction clinic, family therapy, MAT program',
    badge: 'Govt. Apex Institute'
  },
  {
    name: 'AIIMS NDDTC (National Drug Dependence Treatment Centre)',
    type: 'National Apex De-Addiction Center',
    phone: '011-26588500',
    location: 'Ghaziabad / New Delhi (NCR)',
    address: 'CGO Complex, Sector 19, Kamla Nehru Nagar, Ghaziabad, UP 201002',
    services: 'Comprehensive opioid substitution therapy (OST), alcohol detox, clinical research',
    badge: 'Apex Center'
  },
  {
    name: 'TTK Hospital & De-Addiction Centre',
    type: 'Pioneer Rehabilitation & Caregiver Center',
    phone: '044-24918464',
    location: 'Chennai, Tamil Nadu',
    address: '4th Main Road, Indira Nagar, Adyar, Chennai, Tamil Nadu 600020',
    services: '28-day residential rehabilitation, caregiver support, community outreach',
    badge: 'Vetted Non-Profit'
  },
  {
    name: 'Muktangan Mitra De-Addiction Centre',
    type: 'Comprehensive Rehabilitation & Prevention Center',
    phone: '020-26697676',
    location: 'Pune, Maharashtra',
    address: 'Mohanwadi, Yerawada, Pune, Maharashtra 411006',
    services: 'Holistic rehabilitation, relapse prevention workshops, caregiver counseling',
    badge: 'Vetted Center'
  }
];

class CrisisAIEngine {
  /**
   * Generates dynamic emergency scripts based on role and urgency
   */
  generateEmergencyScript(role) {
    const scripts = {
      user_craving: `Take a deep breath and read these words aloud right now:\n\n"I am experiencing a physical urge in my body. It feels heavy right now, but a craving is just a chemical signal that peaks and passes. I do not have to act on this urge today. I am choosing my freedom and my health. I am breathing slowly, and I am in control of my next step."`,
      
      user_panic: `Read this aloud to ground your mind:\n\n"My body is reacting to stress, but I am physically safe right now. My heart is beating fast to protect me, but there is no immediate danger. I place both feet firmly on the floor. I breathe in for 4 seconds, and exhale long for 6 seconds. This panic attack will pass in a few minutes."`,

      caregiver_deescalate: `Script to speak softly to your loved one in distress:\n\n"I can see that you are in a lot of pain and high stress right now. I am not here to judge, argue, or lecture you. I care about your safety. Let's step away from this room together, get a glass of cold water, and just breathe for five minutes without talking about the past."`,

      caregiver_confrontation: `Script to state clear, empathetic boundaries:\n\n"I love you and I want you to be healthy. However, I cannot give you money or enable substance use. I will always support your active treatment and recovery, but I must protect my own health and boundaries. Whenever you are ready to reach out for professional help or attend a session, I will walk beside you."`
    };

    return scripts[role] || scripts.user_craving;
  }

  /**
   * Simulates Web Push Alert notification sent to designated Caregiver
   */
  async triggerCaregiverWebPushAlert() {
    const profile = window.storageManager ? await window.storageManager.getProfile() : { caregiverName: 'Caregiver' };
    
    // Web Notification API if permitted
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('🚨 Anchor Safety Alert', {
        body: `${profile.name || 'Your loved one'} activated Emergency SOS. Tap to view location & safety script.`,
        icon: './manifest.json'
      });
    }

    return {
      success: true,
      message: `Web Push Alert simulated and dispatched to ${profile.caregiverName || 'Caregiver'}!`,
      timestamp: new Date().toLocaleTimeString(),
      scriptForCaregiver: `Emergency Caregiver Action Script:\n1. Stay calm and call ${profile.name || 'loved one'}.\n2. Use non-judgmental voice tone.\n3. Nearest Naloxone & Emergency Center: Check India Directory map.`
    };
  }

  getIndiaDirectory() {
    return INDIA_TREATMENT_DIRECTORY;
  }
}

window.crisisAiEngine = new CrisisAIEngine();
