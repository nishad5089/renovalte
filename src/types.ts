export type Role = 'contractor' | 'craftsman';

export type ProjectStatus =
  | 'new'
  | 'summarized'
  | 'inspected'
  | 'draft'
  | 'sent';

export type ProjectType =
  | 'kitchen'
  | 'bathroom'
  | 'living_room'
  | 'bedroom_flooring'
  | 'kitchen_refresh';

export interface ProjectPhoto {
  id: string;
  url: string;
  caption: string;
}

export interface Project {
  id: string;
  name: string;
  city: string;
  budget: number;
  status: ProjectStatus;
  type: ProjectType;
  customerName: string;
  customerEmail: string;
  address: string;
  createdAt: string;
  customerRequirement: string;
  photos: ProjectPhoto[];
  audioTranscript: string;
  aiSummary: string | null;
  rooms?: string;
  style?: string;
  timeline?: string;
}

export type ProjectStatusKey = 'all' | ProjectStatus;

/* ---------- AI Assistant ---------- */

export type ChatRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: number;
  privacyMasked?: boolean;
}

export type SuggestedPromptKey =
  | 'summarize'
  | 'missing'
  | 'materials'
  | 'proposal';

export interface StructuredSummarySection {
  title: string;
  items: string[];
}

export interface StructuredSummary {
  workScope: string[];
  currentCondition: string[];
  preferences: string[];
  assumptions: string[];
  openQuestions: string[];
  generatedAt: number;
}

export interface ProjectAIState {
  chat: ChatMessage[];
  structuredSummary: StructuredSummary | null;
}

/* ---------- Site Visit ---------- */

export interface SiteVisitPhoto {
  id: string;
  url: string;
  caption: string;
  uploadedAt: number;
}

export type ObservationCategory =
  | 'condition'
  | 'measurement'
  | 'damage'
  | 'material'
  | 'access'
  | 'other';

export interface SiteObservation {
  id: string;
  note: string;
  category: ObservationCategory;
  recordedAt: number;
  photoId?: string;
  transcript?: string; // attached simulated voice transcript
}

export interface RequirementDiff {
  field: string;
  original: string;
  siteFinding: string;
  impact: 'confirmed' | 'discrepancy' | 'additional';
}

export interface SiteVisit {
  id: string;
  visitDate: number;
  photos: SiteVisitPhoto[];
  observations: SiteObservation[];
  diffs: RequirementDiff[];
  updatedSummary: string | null;
  updatedSummaryAt: number | null;
}

export type ProjectSiteVisitState = SiteVisit[];

/* ---------- Proposal Generator ---------- */

export type PackageTier = 'basic' | 'standard' | 'premium';

export interface ProposalOption {
  tier: PackageTier;
  label: string;
  tagline: string;
  workScope: string[];
  materials: string[];
  qualityLevel: string;
  priceMin: number;
  priceMax: number;
  durationWeeks: string;
  assumptions: string[];
  exclusions: string[];
}

export interface ProposalWorkStep {
  id: string;
  title: string;
  description: string;
  duration: string;
}

export interface ProposalMaterial {
  id: string;
  name: string;
  spec: string;
  quantity: string;
}

export interface ProposalDraft {
  id: string;
  selectedTier: PackageTier;
  title: string;
  scope: string;
  workSteps: ProposalWorkStep[];
  materials: ProposalMaterial[];
  priceMin: number;
  priceMax: number;
  timeline: string;
  assumptions: string[];
  createdAt: number;
  updatedAt: number;
}

export interface ProposalVersion {
  id: string;
  savedAt: number;
  label: string;
  snapshot: ProposalDraft;
}

export interface ProjectProposalState {
  options: ProposalOption[] | null;      // generated comparison options
  optionsGeneratedAt: number | null;
  selectedTier: PackageTier | null;
  draft: ProposalDraft | null;
  versions: ProposalVersion[];
  sendHistory: SendRecord[];            // simulated proposal delivery log
  visualizations: ContractorVisualization[]; // AI before/after concept visualizations
}

/* ---------- Contractor AI Visualization ---------- */

export interface ContractorVisualization {
  id: string;
  proposalDraftId: string | null;   // linked proposal draft (null = unattached)
  beforePhotoUrl: string;            // customer photo or contractor upload
  afterPhotoUrl: string;             // simulated AI-generated result
  prompt: string;                    // renovation description used
  tier: PackageTier | null;          // linked proposal package
  approved: boolean;                 // only approved appear in PDF/sending
  createdAt: number;
}

/* ---------- Proposal sending ---------- */

export type SendChannel = 'email' | 'whatsapp' | 'link';
export type SendStatus = 'success' | 'failed';

export interface SendRecord {
  id: string;
  channel: SendChannel;
  recipient: string;          // email address or phone or "Share link"
  subject: string;            // email subject; link title for others
  body: string;                // message body sent
  versionLabel: string;        // which draft version was sent
  status: SendStatus;
  sentAt: number;
  pdfFilename: string;        // name of the attached/exported PDF
  simulated: true;             // always true — no real delivery
}

/* ---------- Craftsman experience ---------- */

export type CraftsmanLang = 'en' | 'de';

export type CraftsmanMsgRole = 'user' | 'assistant' | 'system' | 'warning';

export interface CraftsmanPhoto {
  id: string;
  url: string;
  caption: string;
  uploadedAt: number;
}

export interface CraftsmanMessage {
  id: string;
  role: CraftsmanMsgRole;
  content: string;
  timestamp: number;
  photoId?: string;
  isVoice?: boolean;
  warningType?: 'electrical' | 'gas' | 'structural' | 'none';
}

export type GuidanceCategory = 'tools' | 'materials' | 'preparation' | 'safety' | 'actions';

export interface GuidanceStep {
  id: string;
  category: GuidanceCategory;
  title: string;
  description: string;
  items?: string[];
}

export interface QuestionRecord {
  id: string;
  question: string;
  answer: string;
  askedAt: number;
  category: string;
}

export interface VisualizationRecord {
  id: string;
  prompt: string;
  beforePhotoUrl: string;
  afterPhotoUrl: string;
  savedAt: number;
}

export interface CraftsmanProjectState {
  chat: CraftsmanMessage[];
  photos: CraftsmanPhoto[];
  questions: QuestionRecord[];
  guidance: GuidanceStep[];
  guidanceGeneratedFor: string | null; // project type key
  visualizations: VisualizationRecord[];
  activeVisualizationId: string | null;
}
