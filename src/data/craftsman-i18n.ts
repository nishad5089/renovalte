import type { CraftsmanLang } from '../types';

export interface CraftsmanI18n {
  appName: string;
  role: string;
  switchRole: string;
  // Bottom nav
  navHome: string;
  navContext: string;
  navChat: string;
  navGuidance: string;
  navHistory: string;
  // Home
  welcome: string;
  selectProject: string;
  selectProjectDesc: string;
  noProjects: string;
  assignedTo: string;
  // Context
  requirements: string;
  siteObservations: string;
  noObservations: string;
  customerRequirement: string;
  projectType: string;
  rooms: string;
  timeline: string;
  style: string;
  // Chat
  askQuestion: string;
  send: string;
  recording: string;
  stopTranscribe: string;
  startRecording: string;
  transcribing: string;
  addPhoto: string;
  suggestedQuestions: string;
  simulatedAI: string;
  // Guidance
  stepByStep: string;
  stepByStepDesc: string;
  tools: string;
  materials: string;
  preparation: string;
  safety: string;
  actions: string;
  generateGuidance: string;
  // Visualization
  navVisual: string;
  visualization: string;
  visualizationDesc: string;
  conceptOnly: string;
  conceptOnlyBadge: string;
  uploadBeforePhoto: string;
  beforePhotoHint: string;
  useProjectPhoto: string;
  appearancePrompt: string;
  promptPlaceholder: string;
  generateVisualization: string;
  generating: string;
  generatingSteps: string;
  regenerate: string;
  beforeAfter: string;
  before: string;
  after: string;
  saveVisualization: string;
  savedVisualization: string;
  visualHistory: string;
  noVisualizations: string;
  exampleLoaded: string;
  sliderHint: string;
  // History
  questionHistory: string;
  questionHistoryDesc: string;
  noQuestions: string;
  askedOn: string;
  askHint: string;
  // Warning
  safetyWarning: string;
  stopWork: string;
  contactProfessional: string;
  warningElectrical: string;
  warningGas: string;
  warningStructural: string;
  // Misc
  simulated: string;
}

const en: CraftsmanI18n = {
  appName: 'RenovAIte',
  role: 'Craftsman',
  switchRole: 'Switch role',
  navHome: 'Home',
  navContext: 'Context',
  navChat: 'AI Chat',
  navGuidance: 'Guidance',
  navHistory: 'History',
  welcome: 'Welcome back',
  selectProject: 'Select your assigned project',
  selectProjectDesc: 'Choose a project to access AI guidance, context, and step-by-step instructions.',
  noProjects: 'No projects assigned yet.',
  assignedTo: 'Assigned to',
  requirements: 'Renovation requirements',
  siteObservations: 'Site observations',
  noObservations: 'No site observations recorded for this project.',
  customerRequirement: 'Customer requirement',
  projectType: 'Project type',
  rooms: 'Rooms',
  timeline: 'Timeline',
  style: 'Style',
  askQuestion: 'Ask a question about this project…',
  send: 'Send',
  recording: 'Recording',
  stopTranscribe: 'Stop & transcribe',
  startRecording: 'Start recording',
  transcribing: 'Transcribing…',
  addPhoto: 'Add photo',
  suggestedQuestions: 'Suggested questions',
  simulatedAI: 'Simulated AI — deterministic responses, no external service.',
  stepByStep: 'Step-by-step guidance',
  stepByStepDesc: 'Tools, materials, preparation, safety, and suggested actions for this project type.',
  tools: 'Tools',
  materials: 'Materials',
  preparation: 'Preparation',
  safety: 'Safety',
  actions: 'Suggested actions',
  generateGuidance: 'Generate guidance',
  questionHistory: 'Question history',
  questionHistoryDesc: 'All questions you have asked the AI for this project.',
  noQuestions: 'No questions asked yet.',
  askedOn: 'Asked on',
  askHint: 'Ask a question in the AI Chat tab to build your history.',
  safetyWarning: 'SAFETY WARNING',
  stopWork: 'Stop all work in the affected area immediately.',
  contactProfessional: 'Contact a qualified professional before proceeding.',
  warningElectrical: 'Electrical hazard detected',
  warningGas: 'Gas connection hazard detected',
  warningStructural: 'Structural damage detected',
  simulated: 'Simulated',
  navVisual: 'Visual',
  visualization: 'AI Visualization',
  visualizationDesc: 'Upload a before photo, describe the desired look, and generate a concept visualization.',
  conceptOnly: 'AI Visualization — Concept Only',
  conceptOnlyBadge: 'CONCEPT ONLY',
  uploadBeforePhoto: 'Upload original photo',
  beforePhotoHint: 'Select a photo of the current room to transform.',
  useProjectPhoto: 'Use first project photo',
  appearancePrompt: 'Describe the desired appearance',
  promptPlaceholder: 'e.g. Modern white kitchen with oak worktop, warm LED lighting, matte black fixtures…',
  generateVisualization: 'Generate visualization',
  generating: 'Generating visualization…',
  generatingSteps: 'Analysing photo · Synthesising style · Rendering concept',
  regenerate: 'Regenerate',
  beforeAfter: 'Before / After',
  before: 'Before',
  after: 'After',
  saveVisualization: 'Save to project',
  savedVisualization: 'Saved to project history',
  visualHistory: 'Saved visualizations',
  noVisualizations: 'No visualizations saved yet.',
  exampleLoaded: 'Example renovated kitchen loaded',
  sliderHint: 'Drag to compare',
};

const de: CraftsmanI18n = {
  appName: 'RenovAIte',
  role: 'Handwerker',
  switchRole: 'Rolle wechseln',
  navHome: 'Start',
  navContext: 'Kontext',
  navChat: 'KI Chat',
  navGuidance: 'Anleitung',
  navHistory: 'Verlauf',
  welcome: 'Willkommen zurück',
  selectProject: 'Wählen Sie Ihr zugewiesenes Projekt',
  selectProjectDesc: 'Wählen Sie ein Projekt für KI-Anleitung, Kontext und Schritt-für-Schritt-Anweisungen.',
  noProjects: 'Noch keine Projekte zugewiesen.',
  assignedTo: 'Zugewiesen an',
  requirements: 'Renovierungsanforderungen',
  siteObservations: 'Vor-Ort-Beobachtungen',
  noObservations: 'Keine Vor-Ort-Beobachtungen für dieses Projekt.',
  customerRequirement: 'Kundenanforderung',
  projectType: 'Projekttyp',
  rooms: 'Räume',
  timeline: 'Zeitplan',
  style: 'Stil',
  askQuestion: 'Stellen Sie eine Frage zu diesem Projekt…',
  send: 'Senden',
  recording: 'Aufnahme',
  stopTranscribe: 'Stoppen & transkribieren',
  startRecording: 'Aufnahme starten',
  transcribing: 'Transkribieren…',
  addPhoto: 'Foto hinzufügen',
  suggestedQuestions: 'Vorgeschlagene Fragen',
  simulatedAI: 'Simulierte KI — deterministische Antworten, kein externer Dienst.',
  stepByStep: 'Schritt-für-Schritt-Anleitung',
  stepByStepDesc: 'Werkzeuge, Materialien, Vorbereitung, Sicherheit und vorgeschlagene Aktionen für diesen Projekttyp.',
  tools: 'Werkzeuge',
  materials: 'Materialien',
  preparation: 'Vorbereitung',
  safety: 'Sicherheit',
  actions: 'Vorgeschlagene Aktionen',
  generateGuidance: 'Anleitung generieren',
  questionHistory: 'Fragenverlauf',
  questionHistoryDesc: 'Alle Fragen, die Sie der KI für dieses Projekt gestellt haben.',
  noQuestions: 'Noch keine Fragen gestellt.',
  askedOn: 'Gefragt am',
  askHint: 'Stellen Sie eine Frage im KI-Chat-Tab, um Ihren Verlauf zu erstellen.',
  safetyWarning: 'SICHERHEITSWARNUNG',
  stopWork: 'Stoppen Sie sofort alle Arbeiten im betroffenen Bereich.',
  contactProfessional: 'Kontaktieren Sie einen qualifizierten Fachmann, bevor Sie fortfahren.',
  warningElectrical: 'Elektrische Gefahr erkannt',
  warningGas: 'Gasanchluss-Gefahr erkannt',
  warningStructural: 'Strukturschaden erkannt',
  simulated: 'Simuliert',
  navVisual: 'Visual',
  visualization: 'KI-Visualisierung',
  visualizationDesc: 'Laden Sie ein Vorher-Foto hoch, beschreiben Sie das Aussehen und generieren Sie eine Konzeptvisualisierung.',
  conceptOnly: 'KI-Visualisierung — Nur Konzept',
  conceptOnlyBadge: 'NUR KONZEPT',
  uploadBeforePhoto: 'Originalfoto hochladen',
  beforePhotoHint: 'Wählen Sie ein Foto des aktuellen Raums.',
  useProjectPhoto: 'Erstes Projektfoto verwenden',
  appearancePrompt: 'Gewünschtes Aussehen beschreiben',
  promptPlaceholder: 'z.B. Moderne weiße Küche mit Eichen-Arbeitsplatte, warme LED-Beleuchtung, mattschwarze Armaturen…',
  generateVisualization: 'Visualisierung generieren',
  generating: 'Visualisierung wird generiert…',
  generatingSteps: 'Foto wird analysiert · Stil wird synthetisiert · Konzept wird gerendert',
  regenerate: 'Neu generieren',
  beforeAfter: 'Vorher / Nachher',
  before: 'Vorher',
  after: 'Nachher',
  saveVisualization: 'Im Projekt speichern',
  savedVisualization: 'In Projektverlauf gespeichert',
  visualHistory: 'Gespeicherte Visualisierungen',
  noVisualizations: 'Noch keine Visualisierungen gespeichert.',
  exampleLoaded: 'Beispiel-renovierte Küche geladen',
  sliderHint: 'Zum Vergleichen ziehen',
};

const labels: Record<CraftsmanLang, CraftsmanI18n> = { en, de };

export function getCraftsmanI18n(lang: CraftsmanLang): CraftsmanI18n {
  return labels[lang] ?? en;
}

export const suggestedQuestionsEN = [
  'Which tools might I need to remove old kitchen cabinets?',
  'How do I safely disconnect the electrical supply?',
  'What materials should I prepare for the new countertop?',
  'What safety precautions should I take before demolition?',
];

export const suggestedQuestionsDE = [
  'Welche Werkzeuge brauche ich, um alte Küchenschränke zu entfernen?',
  'Wie trenne ich die Stromversorgung sicher?',
  'Welche Materialien soll ich für die neue Arbeitsplatte vorbereiten?',
  'Welche Sicherheitsvorkehrungen sollte ich vor dem Abriss treffen?',
];

export function getSuggestedQuestions(lang: CraftsmanLang): string[] {
  return lang === 'de' ? suggestedQuestionsDE : suggestedQuestionsEN;
}
