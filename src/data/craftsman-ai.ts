import type { Project, CraftsmanLang, GuidanceStep, GuidanceCategory } from '../types';

let idCounter = 0;
function uid(prefix: string): string {
  idCounter += 1;
  return `${prefix}_${Date.now()}_${idCounter}`;
}

/* ============================================================
 * Deterministic mock AI chat responses
 * Handles the example question and general renovation queries.
 * ============================================================ */

export interface CraftsmanAIResponse {
  content: string;
  warningType: 'electrical' | 'gas' | 'structural' | 'none';
  category: string;
}

const HAZARD_KEYWORDS = {
  electrical: ['wiring', 'cable', 'electrical', 'wire', 'strom', 'kabel', 'elektrisch', 'socket', 'steckdose', 'outlet', 'junction', 'live wire', 'exposed wire', 'breaker'],
  gas: ['gas', 'pipe', 'gasleitung', 'gaspipe', 'gas connection', 'gas line', 'gasanschluss'],
  structural: ['structural', 'load-bearing', 'support beam', 'crack in wall', 'structural damage', 'foundation', 'stützmauer', 'tragend', 'riß', 'risse', 'strukturschaden', 'load wall', 'structural crack'],
};

function detectHazard(question: string): 'electrical' | 'gas' | 'structural' | 'none' {
  const q = question.toLowerCase();
  for (const kw of HAZARD_KEYWORDS.electrical) if (q.includes(kw)) return 'electrical';
  for (const kw of HAZARD_KEYWORDS.gas) if (q.includes(kw)) return 'gas';
  for (const kw of HAZARD_KEYWORDS.structural) if (q.includes(kw)) return 'structural';
  return 'none';
}

export function craftsmanAIReply(question: string, project: Project, lang: CraftsmanLang): CraftsmanAIResponse {
  const q = question.toLowerCase();
  const hazard = detectHazard(question);

  // Hazard warning takes priority
  if (hazard === 'electrical') {
    return {
      content: lang === 'de'
        ? `ELEKTRISCHE GEFAHR ERKANNT. Stoppen Sie sofort alle Arbeiten in der Nähe von elektrischen Leitungen oder Komponenten. Berühren Sie keine freiliegenden Kabel oder Drähte. Schalten Sie den Strom am Sicherungskasten ab und verifizieren Sie, dass der Strom abgeschaltet ist. Kontaktieren Sie einen qualifizierten Elektriker, bevor Sie fortfahren. Versuchen Sie niemals, elektrische Arbeiten selbst durchzuführen, es sei denn, Sie sind entsprechend qualifiziert und zertifiziert.`
        : `ELECTRICAL HAZARD DETECTED. Stop all work near electrical wiring or components immediately. Do not touch any exposed cables or wires. Turn off power at the breaker panel and verify it is de-energised. Contact a qualified electrician before proceeding. Never attempt electrical work yourself unless you are properly qualified and certified.`,
      warningType: 'electrical',
      category: 'safety',
    };
  }
  if (hazard === 'gas') {
    return {
      content: lang === 'de'
        ? `GASGEFAHR ERKANNT. Stoppen Sie sofort alle Arbeiten in der Nähe von Gasleitungen. Rauchen Sie nicht und verwenden Sie kein offenes Feuer oder Funken erzeugende Werkzeuge. Wenn Sie Gasgeruch wahrnehmen, verlassen Sie das Gebäude und rufen Sie den Gas-Notdienst. Versuchen Sie niemals, Gasleitungen selbst zu trennen oder zu verschieben — dies muss von einem zertifizierten Gasinstallateur durchgeführt werden.`
        : `GAS HAZARD DETECTED. Stop all work near gas pipes immediately. Do not smoke or use any open flames or spark-generating tools. If you smell gas, leave the building and call the gas emergency service. Never attempt to disconnect or move gas lines yourself — this must be done by a certified gas fitter.`,
      warningType: 'gas',
      category: 'safety',
    };
  }
  if (hazard === 'structural') {
    return {
      content: lang === 'de'
        ? `STRUKTURSCHADEN ERKANNT. Stoppen Sie alle Arbeiten in der Nähe des betroffenen Bereichs. Nehmen Sie keine Wände, Träger oder Stützelemente ohne strukturelle Begutachtung durch einen Statiker oder Bauingenieur ab. Ein struktureller Zusammenbruch kann zu schweren Verletzungen führen. Kontaktieren Sie einen qualifizierten Bauingenieur, um die Situation zu beurteilen, bevor Sie fortfahren.`
        : `STRUCTURAL DAMAGE DETECTED. Stop all work near the affected area immediately. Do not remove any walls, beams, or support elements without a structural assessment by a qualified structural engineer. Structural collapse can cause severe injury or death. Contact a qualified structural engineer to assess the situation before proceeding.`,
      warningType: 'structural',
      category: 'safety',
    };
  }

  // Tool-related question — the example question
  if (q.includes('tool') || q.includes('werkzeug') || (q.includes('remove') && q.includes('cabinet')) || (q.includes('entfernen') && q.includes('schrank'))) {
    return {
      content: lang === 'de'
        ? `Um alte Küchenschränke zu entfernen, benötigen Sie typischerweise:\n\nWerkzeuge:\n• Akkuschrauber mit Bit-Set (PH2, Torx)\n• Montagehebel / Kuhfuß\n• Hammer (Gummikopf zum Schutz)\n• Cuttermesser zum Lösen von Silikonnähten\n• Schraubendreher-Set (Schlitz + Kreuzschlitz)\n• Zange / Seitenschneider für Kabelbinder\n• Schutzbrille, Arbeitshandschuhe, Staubmaske\n\nVorgehen:\n1. Strom und Wasser abschalten\n2. Schränke ausräumen\n3. Schrauben an den Scharnieren lösen, Fronten abnehmen\n4. Arbeitsplatte vom Unterbau lösen (Silikonnähte durchschneiden)\n5. Befestigungsschrauben an der Wand lösen\n6. Schränke vorsichtig abnehmen und zur Entsorgung bereitstellen\n\nAchtung: Bei elektrischen Anschlüssen oder Gasleitungen sofort stoppen und einen Fachmann rufen.`
        : `To remove old kitchen cabinets you will typically need:\n\nTools:\n• Cordless drill/driver with bit set (PH2, Torx)\n• Pry bar / crowbar\n• Rubber mallet (to protect surfaces)\n• Utility knife to cut silicone seals\n• Screwdriver set (flathead + Phillips)\n• Pliers / side cutters for cable ties\n• Safety goggles, work gloves, dust mask\n\nProcedure:\n1. Turn off power and water supply\n2. Empty all cabinets\n3. Unscrew hinge screws, remove door fronts\n4. Detach worktop from base (cut silicone seals)\n5. Remove fixing screws from wall brackets\n6. Carefully lift cabinets off and set aside for disposal\n\nCaution: If you encounter electrical connections or gas lines, stop immediately and call a qualified professional.`,
      warningType: 'none',
      category: 'tools',
    };
  }

  // Materials question
  if (q.includes('material') || q.includes('countertop') || q.includes('worktop') || q.includes('arbeitsplatte')) {
    return {
      content: lang === 'de'
        ? `Für die neue Arbeitsplatte sollten Sie folgende Materialien vorbereiten:\n\n• Arbeitsplatte (z.B. weißer Quarzkomposit, 20mm)\n• Befestigungskleber oder Montageschaum\n• Silikon zum Abdichten der Nähte\n• Befestigungswinkel für den Unterbau\n• Schleifpapier / Feile für Kantenbearbeitung\n\nHinweis: Lassen Sie die Arbeitsplatte vor der Montage 24h akklimatisieren und messen Sie die Abschnitte doppelt vor dem Zuschnitt.`
        : `For the new worktop you should prepare the following materials:\n\n• Worktop (e.g. white quartz composite, 20mm)\n• Adhesive or mounting foam\n• Silicone for sealing joints\n• Mounting brackets for base units\n• Sandpaper / file for edge finishing\n\nNote: Allow the worktop to acclimatise for 24h before installation and measure cuts twice before cutting.`,
      warningType: 'none',
      category: 'materials',
    };
  }

  // Safety question
  if (q.includes('safety') || (q.includes('precaution') && q.includes('demolition')) || q.includes('sicherheit') || q.includes('sicherheitsvorkehrung')) {
    return {
      content: lang === 'de'
        ? `Sicherheitsvorkehrungen vor dem Abriss:\n\n• Strom und Wasser im Arbeitsbereich abschalten\n• Persönliche Schutzausrüstung tragen (Brille, Handschuhe, Maske, Gehörschutz)\n• Arbeitsbereich mit Staubwänden abtrennen\n• Boden und angrenzende Flächen abdecken\n• Fluchtwege freihalten\n• Bei Asbestverdacht: Stoppen und Fachfirma beauftragen\n• Bei elektrischen, Gas- oder Strukturrisiken: Stoppen und Fachmann konsultieren`
        : `Safety precautions before demolition:\n\n• Turn off power and water in the work area\n• Wear personal protective equipment (goggles, gloves, mask, hearing protection)\n• Seal the work area with dust barriers\n• Cover floors and adjacent surfaces\n• Keep escape routes clear\n• If asbestos is suspected: stop and hire a specialist contractor\n• For electrical, gas, or structural risks: stop and consult a qualified professional`,
      warningType: 'none',
      category: 'safety',
    };
  }

  // Preparation question
  if (q.includes('prepar') || q.includes('vorbereit')) {
    return {
      content: lang === 'de'
        ? `Vorbereitung für die ${project.type.replace('_', ' ')} in ${project.city}:\n\n1. Arbeitsbereich räumen und Möbel schützen\n2. Strom- und Wasserversorgung abschalten\n3. Staubwände errichten und Boden abdecken\n4. Werkzeuge und Materialien bereitlegen\n5. Entsorgungsbehälter bestellen\n6. Sicherheitsausrüstung prüfen\n\nDauer: ca. 1–2 Stunden je nach Raumgröße.`
        : `Preparation for the ${project.type.replace('_', ' ')} in ${project.city}:\n\n1. Clear the work area and protect furniture\n2. Shut off power and water supply\n3. Erect dust barriers and cover floors\n4. Lay out tools and materials\n5. Order a disposal skip\n6. Check safety equipment\n\nDuration: approx. 1–2 hours depending on room size.`,
      warningType: 'none',
      category: 'preparation',
    };
  }

  // Default response
  return {
    content: lang === 'de'
      ? `Basierend auf dem Projekt "${project.name}" in ${project.city}: Ich kann Ihnen bei Werkzeugen, Materialien, Sicherheitshinweisen und Schritt-für-Schritt-Anleitungen helfen. Stellen Sie eine konkrete Frage oder wählen Sie einen der Vorschläge aus. Für gefährliche Situationen (Strom, Gas, Statik) stoppe ich Sie und verweise auf Fachleute.`
      : `Based on the "${project.name}" project in ${project.city}: I can help you with tools, materials, safety guidance, and step-by-step instructions. Ask a specific question or pick one of the suggested prompts. For hazardous situations (electrical, gas, structural), I will warn you to stop and advise contacting qualified professionals.`,
    warningType: 'none',
    category: 'general',
  };
}

/* ============================================================
 * Simulated voice transcription
 * ============================================================ */

export function simulateCraftsmanTranscription(project: Project, durationSec: number, lang: CraftsmanLang): string {
  if (lang === 'de') {
    const phrases = [
      `Ich brauche eine Anleitung für die ${project.type.replace('_', ' ')} in ${project.city}.`,
      'Welche Werkzeuge brauche ich für den Abbau?',
      'Soll ich auf etwas Bestimmtes bei der Sicherheit achten?',
    ];
    const count = Math.max(1, Math.min(phrases.length, Math.round(durationSec / 8) + 1));
    return phrases.slice(0, count).join(' ');
  }
  const phrases = [
    `I need guidance for the ${project.type.replace('_', ' ')} in ${project.city}.`,
    'Which tools might I need to remove old kitchen cabinets?',
    'What should I watch out for in terms of safety?',
  ];
  const count = Math.max(1, Math.min(phrases.length, Math.round(durationSec / 8) + 1));
  return phrases.slice(0, count).join(' ');
}

/* ============================================================
 * Step-by-step guidance generation
 * ============================================================ */

export function generateGuidance(project: Project, lang: CraftsmanLang): GuidanceStep[] {
  if (lang === 'de') {
    return guidanceDE(project);
  }
  return guidanceEN(project);
}

function guidanceEN(project: Project): GuidanceStep[] {
  const isKitchen = project.type === 'kitchen' || project.type === 'kitchen_refresh';
  const isBathroom = project.type === 'bathroom';
  const isFlooring = project.type === 'bedroom_flooring';

  return [
    {
      id: uid('g'),
      category: 'preparation',
      title: 'Prepare the work area',
      description: `Set up for the ${project.type.replace('_', ' ')} renovation in ${project.city}.`,
      items: [
        'Turn off power and water supply to the work area',
        'Clear the room of furniture and appliances',
        'Erect dust barriers to protect adjacent areas',
        'Cover floors and doorways with protective sheeting',
        'Ensure adequate ventilation',
        'Order disposal skip for demolition waste',
      ],
    },
    {
      id: uid('g'),
      category: 'tools',
      title: 'Required tools',
      description: isKitchen ? 'Tools for kitchen cabinet and worktop removal/installation' : isBathroom ? 'Tools for bathroom fixture removal and tiling' : 'General renovation tools',
      items: isKitchen
        ? ['Cordless drill/driver (PH2, Torx bits)', 'Pry bar / crowbar', 'Rubber mallet', 'Utility knife', 'Screwdriver set', 'Pliers', 'Safety goggles, gloves, dust mask', 'Spirit level', 'Measuring tape']
        : isBathroom
        ? ['Cordless drill with tile bits', 'Chisel and hammer', 'Grout saw', 'Pipe wrench', 'Silicone gun', 'Tile cutter', 'Spirit level', 'Safety goggles, gloves, knee pads']
        : ['Pry bar', 'Hammer', 'Utility knife', 'Floor scraper', 'Measuring tape', 'Spirit level', 'Safety goggles, gloves, dust mask'],
    },
    {
      id: uid('g'),
      category: 'materials',
      title: 'Materials needed',
      description: `Materials for ${project.name}.`,
      items: isKitchen
        ? ['New cabinet fronts and hardware', 'Worktop material', 'Under-cabinet LED strips', 'Silicone sealant', 'Screws and wall plugs', 'Paint and primer for walls']
        : isBathroom
          ? ['Large-format porcelain tiles', 'Tile adhesive', 'Grout', 'Waterproofing membrane (DIN 18534)', 'Silicone sealant', 'Walk-in shower kit', 'Wall-mounted WC bracket']
          : ['Engineered oak flooring', 'Heating-compatible adhesive', 'Underlay (if applicable)', 'Skirting boards', 'Transition strips', 'Spacers'],
    },
    {
      id: uid('g'),
      category: 'safety',
      title: 'Safety precautions',
      description: 'Critical safety guidance — read before starting work.',
      items: [
        'Verify power is isolated at the breaker before any electrical work',
        'Verify water supply is shut off before plumbing work',
        'Wear PPE at all times (goggles, gloves, mask, hearing protection)',
        'If you encounter exposed wiring, STOP and call an electrician',
        'If you smell gas, STOP, leave the building, and call the gas emergency service',
        'If you find structural cracks or damage, STOP and consult a structural engineer',
        'Do not remove load-bearing walls without engineering approval',
        'Ensure asbestos testing before disturbing old materials',
      ],
    },
    {
      id: uid('g'),
      category: 'actions',
      title: 'Suggested actions sequence',
      description: 'Recommended order of work steps.',
      items: isKitchen
        ? [
          '1. Turn off power and water',
          '2. Remove cabinet doors and drawer fronts',
          '3. Disconnect and remove old appliances',
          '4. Remove worktop (cut silicone seals first)',
          '5. Remove wall and base cabinets',
          '6. Prepare walls (patch, prime, paint)',
          '7. Install new base cabinets and level',
          '8. Install worktop and seal joints',
          '9. Install cabinet fronts and hardware',
          '10. Fit under-cabinet LED strips',
          '11. Install and connect new appliances',
          '12. Final cleanup and inspection',
        ]
        : isBathroom
        ? [
          '1. Turn off water and power',
          '2. Remove old fixtures (toilet, vanity, bathtub)',
          '3. Strip old tiles and waterproofing',
          '4. Inspect and repair substrate',
          '5. Install new waterproofing membrane',
          '6. Install walk-in shower base and tray',
          '7. Lay floor and wall tiles',
          '8. Grout and seal joints',
          '9. Install vanity, toilet, and fixtures',
          '10. Connect plumbing and test for leaks',
          '11. Apply silicone seals',
          '12. Final cleanup and inspection',
        ]
        : [
          '1. Clear rooms of furniture',
          '2. Remove old flooring (carpet, underlay)',
          '3. Inspect and prepare subfloor',
          '4. Acclimatise new flooring 48–72h',
          '5. Install underfloor heating (if applicable)',
          '6. Lay flooring with heating-compatible adhesive',
          '7. Install skirting boards',
          '8. Fit transition strips',
          '9. Final cleanup and inspection',
        ],
    },
  ];
}

function guidanceDE(project: Project): GuidanceStep[] {
  const isKitchen = project.type === 'kitchen' || project.type === 'kitchen_refresh';
  const isBathroom = project.type === 'bathroom';

  return [
    {
      id: uid('g'),
      category: 'preparation',
      title: 'Arbeitsbereich vorbereiten',
      description: `Vorbereitung für die ${project.type.replace('_', ' ')}-Renovierung in ${project.city}.`,
      items: [
        'Strom und Wasser im Arbeitsbereich abschalten',
        'Raum von Möbeln und Geräten räumen',
        'Staubwände errichten zum Schutz angrenzender Bereiche',
        'Böden und Türöffnungen mit Schutzfolie abdecken',
        'Für ausreichende Belüftung sorgen',
        'Entsorgungscontainer für Abrissmaterial bestellen',
      ],
    },
    {
      id: uid('g'),
      category: 'tools',
      title: 'Benötigte Werkzeuge',
      description: 'Werkzeuge für den Umbau',
      items: isKitchen
        ? ['Akkuschrauber (PH2, Torx Bits)', 'Montagehebel / Kuhfuß', 'Gummihammer', 'Cuttermesser', 'Schraubendreher-Set', 'Zange', 'Schutzbrille, Handschuhe, Staubmaske', 'Wasserwaage', 'Maßband']
        : ['Meißel und Hammer', 'Fugensäge', 'Rohrzange', 'Silikonpresse', 'Fliesenschneider', 'Wasserwaage', 'Schutzbrille, Handschuhe, Knieschoner'],
    },
    {
      id: uid('g'),
      category: 'materials',
      title: 'Benötigte Materialien',
      description: `Materialien für ${project.name}.`,
      items: isKitchen
        ? ['Neue Schrankfronten und Beschläge', 'Arbeitsplattenmaterial', 'LED-Unterbau-Strips', 'Silikondichtstoff', 'Schrauben und Dübel', 'Wandfarbe und Grundierung']
        : ['Großformatige Porzellanfliesen', 'Fliesenkleber', 'Fugenmörtel', 'Abdichtbahn (DIN 18534)', 'Silikondichtstoff', 'Dusche-Walk-in-Set'],
    },
    {
      id: uid('g'),
      category: 'safety',
      title: 'Sicherheitsvorkehrungen',
      description: 'Kritische Sicherheitsregeln — vor Arbeitsbeginn lesen.',
      items: [
        'Strom an der Sicherung trennen vor elektrischen Arbeiten',
        'Wasserversorgung abstellen vor Installationsarbeiten',
        'PSA jederzeit tragen (Brille, Handschuhe, Maske, Gehörschutz)',
        'Bei freiliegenden Kabeln: STOPP — Elektriker rufen',
        'Bei Gasgeruch: STOPP — Gebäude verlassen und Gasnotdienst rufen',
        'Bei Strukturrissen: STOPP — Bauingenieur konsultieren',
        'Tragende Wände nicht ohne statische Prüfung entfernen',
        'Asbesttest vor Störung alter Materialien durchführen',
      ],
    },
    {
      id: uid('g'),
      category: 'actions',
      title: 'Vorgeschlagene Arbeitsschritte',
      description: 'Empfohlene Reihenfolge der Arbeiten.',
      items: isKitchen
        ? ['1. Strom und Wasser abstellen', '2. Schranktüren und Schubladenfronten entfernen', '3. Altgeräte trennen und entfernen', '4. Arbeitsplatte demontieren', '5. Wandschränke und Unterschränke entfernen', '6. Wände vorbereiten (spachteln, grundieren, streichen)', '7. Neue Unterschränke einbauen und ausrichten', '8. Arbeitsplatte installieren und abdichten', '9. Fronten und Beschläge montieren', '10. LED-Unterbau-Strips anbringen', '11. Neue Geräte installieren und anschließen', '12. Endreinigung und Abnahme']
        : ['1. Wasser und Strom abstellen', '2. Altarmaturen entfernen', '3. Alte Fliesen und Abdichtung entfernen', '4. Untergrund prüfen und reparieren', '5. Neue Abdichtungsbahn installieren', '6. Walk-in-Dusche installieren', '7. Fliesen verlegen', '8. Fugen und Dichtungen', '9. Armaturen und Sanitärobjekte montieren', '10. Leitungen anschließen und auf Dichtheit prüfen', '11. Silikondichtungen auftragen', '12. Endreinigung und Abnahme'],
    },
  ];
}
