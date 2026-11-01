# RenovAIte

Clean React + TypeScript + Vite setup. Previous product features have been removed. The current UI has a minimal landing page, desktop/mobile preview and English/German toggles, followed by login and sign-up previews.

## Development

```sh
npm ci
npm run dev -- --host 127.0.0.1
```

## Checks

```sh
npm run typecheck
npm run lint
npm run build
```

`AGENT.md` retains the project requirements for future work. Old browser-local records are not read, modified or deleted by this clean setup.

## Sign-up preview

Login includes a Sign up option. Registration collects first name, last name, email, password, contact number and a renovation-related German trade category. Annex A and uncertain categories show an optional qualification/registration evidence selector (PDF/JPG/PNG, maximum 10 MB). Switching categories clears the document. Selection is local and does not verify qualifications.

Trade classifications use official HwO Annexes A/B; qualification routes refer to § 7 HwO. This curated renovation list is not exhaustive. Requirements depend on activities and business/employee status and must be verified by the responsible authority.

There is no authentication, account database, credential transmission or document upload service. Submitting only validates the preview form; details are not persisted.

## Craftsman workspace

After Continue, enter any non-empty username and password to open the **demo** workspace. This is local navigation, not real authentication; credentials are not sent or persisted. Logout returns to login.

Sidebar: **New requests** (first, with an unread/acknowledgement count), **Projects**, **Dashboard**, with Settings separate. New requests contains only unacknowledged requests. Acknowledging a request moves it to Projects. Projects offers status filters and counts instead of separate proposal/active-project navigation.

Statuses: New request, Acknowledged, Proposal sent, Accepted, In progress, Completed, Declined, Cancelled. There is no Proposal preparation, Draft, Summarized or Inspected lifecycle status. Site visit completed is an independent optional flag. Statuses and the site-visit flag can be changed explicitly in project details; status and site-visit changes are saved in this browser. Dashboard metrics derive from current state; closed projects are excluded from the open pipeline.

English/German and desktop/mobile preview remain available. The sidebar collapses into a menu on small screens. Figures and project records are demo data. Local thumbnails are sourced from Pexels photo IDs 36777558, 35868664, 3935327, 7587481 and 7535073.

## Workspace settings

The workspace has no top preview toolbar. Display (Desktop/Mobile) and language (EN/DE) controls are under the expandable **Settings** option in the sidebar. On small screens, open the navigation menu to reach Settings. Landing and authentication pages use a compact branded header with a Settings dropdown. A shared original SVG logo is used in the sidebar, public header and favicon.

## Project brief / Projektakte

Project details use a compact overview instead of a stretched image. Sections cover Bauvorhaben, Leistungsumfang, Aufmaß, Objekt & Bestand, material preferences, documents and site organization. Scope items show position, description, quantity/unit and evidence. Customer-estimated room area is explicitly distinct from measured/billable quantities; customer budget is distinct from a quotation and its tax treatment remains unconfirmed.

All enriched details are illustrative fixtures in `src/data/projectBriefs.ts`. Unknown addresses, construction dates, access arrangements and missing reports remain visibly unconfirmed. A recorded site visit does not invent a report, measured quantities or technical approval. Source buttons open the local demo brief or reference image; there is no document ingestion or image analysis.

The organization is informed by public BAU AI examples (https://www.bauai.eu/), which separate documents, findings and missing information. German construction terminology and readable units are used; this is not a DIN/VOB-compliant specification or a legal/technical certification. Applicability of standards and trade requirements needs project-specific qualified review.

## Project conversations

Every project opens directly in the chat, including on the first visit. The conversation starts with a project-specific customer-requirements summary (scope, location, approximate customer area, material preferences and timing), with unknowns and demo provenance preserved. Details are available only through **Project details** in the three-dot menu; **Open chat** returns from details. The three-dot header menu provides **Change status**, **Latest sent proposal**, **Project details** and **Back to overview**.

Chat supports text, selected JPG/PNG/WebP images (up to 10 MB), and actual local microphone recordings (up to two minutes / 10 MB). Stop recording, review/play the attachment, then send. Microphone denial or unsupported recording leaves text input available. Audio transcription and visual analysis are not connected: the local assistant explicitly acknowledges that limitation and uses text/project context only. No media or chat is sent to an external AI service.

Visit markers, chat text and project status/site-visit flags use versioned localStorage keys. Binary media uses project-scoped IndexedDB keys. Storage failures are surfaced and do not clear unsent content or overwrite unreadable history. This is browser-local demo persistence, not authenticated server storage.

The latest-sent panel sits beside the conversation on desktop and becomes a closeable drawer on mobile. REN-004 has an explicitly labeled illustrative sent-proposal snapshot; other projects show an empty state until a real sent record exists. A project status does not manufacture a proposal/delivery record. Sent snapshots remain separate from current budgets, status changes and chat. The seeded prices/tax are demonstration calculations, not supplier quotes or legal/tax verification.

Open-question lists are not shown in project details. The underlying clarification context remains available to the project chatbot, which can explain missing information or measurements in conversation.

Professional verification notes are also omitted from the details page to keep it requirement-focused. Their underlying context remains available to the chatbot for relevant safety questions.

## Chat-driven German offer PDF

Ask in the project chat, for example **“Erstelle ein Angebot als PDF”** or **“Create a proposal PDF.”** A compact chat action opens the editable offer beside the conversation (drawer on mobile). New drafts use a project-specific, clearly labeled mock cost catalog with editable material/labor line items and explicit planning quantities. Existing entered values are preserved; empty legacy drafts can opt into the demo estimate. Recent text messages are retained as unverified review context. The local demo does not extract prices or contractual commitments from free text, images or audio. No external AI service is connected.

Add the business/customer/site addresses, quantities, net unit prices, execution period, validity, payment terms and project-specific conditions. Amounts use decimal input converted to integer hundredths, rounding each line to cents, then VAT on the net sum. Explicit choices support standard 19% VAT or confirmed small-business exemption; other tax cases require separate qualified handling. Customer budgets are never used as quotation prices. Missing values remain visibly open in both the review and PDF.

The German A4 PDF includes parties, scope, numbered items, net/VAT/gross, dates, conditions, page numbers and draft identification. It is lazy-loaded only on export. The draft-review checkbox remains clickable even with missing details; outstanding fields stay visible, and any content edit resets review. Review is not legal approval or commissioning. **Every export remains an unverbindlicher Entwurf, not for commissioning**: no professionally reviewed legal template is present, so the prototype cannot issue a certified compliant/binding offer. Contract-specific consumer/withdrawal rules, tax treatment (including §13b where relevant), trade qualifications and permissions need qualified verification before commercial use. References: BGB §145 and §312g, UStG §12 and §19 (official statutes linked in review).

Drafts and immutable export snapshots (version/timestamp/content) are stored locally per project. Download is not customer delivery and never updates the last-sent proposal or project status. Clearing browser data removes these records. No customer data should be entered into this unauthenticated demonstration.

Calculation/storage checks (Node 22+): `node --experimental-strip-types --test tests/offer.test.mjs`. Also run `npm run typecheck`, `npm run lint`, and `npm run build`.

The wider offer drawer has Edit and PDF Preview tabs, with a responsive HTML content preview that works without a browser PDF plugin. The downloaded PDF adds pagination. Both preview and PDF show separate material/labor amounts and two blank signature boxes (provider/customer) explicitly for draft review, not contract acceptance or e-signing. Mock prices and quantities are illustrative teaching assumptions (catalog v1), not market data, supplier quotes, measured quantities or a promised project price. Existing sent-proposal snapshots and request-list price visibility are unaffected.
