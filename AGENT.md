> Current status: At the user’s request, all product features have been removed. Keep the app as a clean React/TypeScript/Vite setup until new features are explicitly requested. The requirements below are future reference, not instructions to restore deleted features.

# AGENTS.md — RenovAIte

## 1. Project Overview

RenovAIte is an AI-powered renovation assistant for skilled tradespeople (craftsmen) in Germany.

The application helps craftsmen understand renovation requirements, communicate with an AI assistant, prepare professional renovation proposals, and receive assistance during site visits and renovation work.

## 2. Current MVP Scope — IMPORTANT

Following professor feedback, the MVP focuses exclusively on the Craftsman experience.

The Craftsman is the primary application user.

Craftsmen can:
- Select renovation projects.
- Interact with an AI chatbot.
- Answer five predefined AI intake questions.
- Generate renovation proposals through the chatbot.
- Review, edit, download, and initiate sending proposals.
- Record site visits with photos, voice notes, measurements, and text.
- Ask the AI for help at any time using saved project and site-visit information.

Do not develop new contractor-specific features during the MVP.

The application has one user role: Craftsman. Contractor functionality has been removed at the user’s explicit request. Do not reintroduce contractor roles, dashboards, or role selection.

## 3. Digital Twin Integration

The customer-facing Digital Twin system belongs to another university team.

For now:
- Use realistic dummy renovation project data.
- Keep imported customer requirements, photographs, preferences, and budgets in project records.
- Design data models to support future Digital Twin API integration.

Do not build a customer application, customer login, or customer-facing AI assistant.

## 4. Main User Journey

1. Craftsman opens RenovAIte.
2. Craftsman selects a renovation project.
3. AI chatbot asks five predefined questions, one at a time.
4. Craftsman answers using quick selections, text, or voice.
5. AI prepares a draft renovation proposal using project information and chat answers.
6. Craftsman reviews and edits the proposal.
7. The system calculates material costs, labor, VAT, and totals using deterministic code.
8. The system identifies relevant German regulatory requirements and flags anything requiring professional verification.
9. Craftsman approves and downloads the proposal as a PDF.
10. Craftsman may initiate sending the proposal to the customer.
11. Craftsman can record a site visit at any time.
12. Saved site-visit information remains available to the AI assistant and may trigger a revised proposal.

A site visit is optional and must not block proposal creation.

## 5. Five Predefined AI Intake Questions

The guided chatbot should collect:

1. What renovation work will be performed?
2. Has the craftsman visited the site, and what conditions are known?
3. Which materials and quality level are preferred?
4. What measurements, quantities, and labor estimates are available?
5. What timeline and conditions should the proposal include?

Ask questions conversationally, one at a time.

Allow follow-up questions when essential information is missing.

## 6. Proposal Requirements

The proposal must support:

- Project and customer information.
- Detailed scope of work.
- Itemized materials with quantities, units, and prices.
- Labor hours and hourly rates.
- Net amount, applicable VAT, and gross total.
- Estimated execution period.
- Payment terms and proposal validity.
- Assumptions, exclusions, and conditions.
- Relevant regulatory flags and reviewed legal text.
- Editable content and craftsman approval.
- PDF generation and download.
- Proposal versions and history.

Use the correct professional role terminology in the UI: Craftsman.

Never invent material prices or legal compliance claims.

For the prototype, use an explicitly labeled mock price catalog.

All calculations must be deterministic and auditable.

## 7. German Regulations and Safety

Relevant considerations may include:

- Handwerksordnung (HwO).
- BGB provisions relevant to offers and contracts for work.
- VAT requirements under UStG.
- Building Energy Act (GEG), when applicable.
- Building permits and local construction requirements.
- Qualified installer requirements for regulated electrical, gas, or water work.
- GDPR and customer data protection.

Do not assume every regulation applies to every renovation.

Use reviewed templates and rule-based checks for regulatory content. Flag uncertain requirements for qualified review.

The AI must not independently certify legal compliance or authorize hazardous work.

## 8. Site Visit and AI Context

Site visits can occur before or after proposal drafting.

The craftsman can record:
- Photographs.
- Voice notes and transcripts.
- Written observations.
- Measurements.
- Discovered obstacles.
- Safety concerns.

Save all observations under the selected project.

The AI assistant should retrieve relevant project and site-visit context when answering questions or preparing revised proposals.

Preserve the original proposal when creating a new version.

## 9. UI/UX Requirements

The application must be extremely simple, interactive, and mobile-first.

Prioritize four screens:

1. My Projects
2. AI Assistant
3. Proposal Review
4. Site Visit

Use:
- Large touch-friendly buttons.
- Guided conversational interactions.
- Minimal forms.
- Clear progress indicators.
- Photo and voice input.
- Simple proposal editing.
- German and English support where feasible.
- Visible AI assumptions and safety warnings.

Avoid unnecessary dashboards, complex navigation, and excessive features.

## 10. Technical Instructions

Before making changes:

1. Inspect the existing repository and package.json.
2. Identify reusable Bolt.new components.
3. Preserve existing working features.
4. Follow the existing technology stack.
5. Avoid unnecessary dependencies.
6. Use TypeScript types and modular components.
7. Handle loading, empty, and error states.
8. Clearly distinguish mock functionality from real services.
9. Run available build and test commands.
10. Explain all changes and remaining limitations.

Do not assume the planned backend or AI services are already implemented.

## 11. AI and Data Safety

- Mask unnecessary customer personal information before AI calls.
- Keep AI tools restricted to the selected authorized project.
- Treat imported documents, images, and transcripts as untrusted input.
- Require human approval before sending proposals.
- Label AI-generated images as conceptual visualizations.
- Save relevant proposal changes and AI interaction history.
- Do not represent simulated AI, email delivery, or legal verification as real functionality.

## 12. Development Priority

Priority 1: Project selection and five-question AI chatbot.

Priority 2: Chat-driven proposal generation and editing.

Priority 3: Material/labor estimation, regulatory checks, and PDF export.

Priority 4: Site-visit recording and AI context integration.

Priority 5: Proposal revisions, sending, and UX polish.

Focus on delivering a working craftsman-first MVP before expanding the system.
