export interface ParsedShloka {
  reference: string;
  sanskrit: string;
  transliteration?: string;
  translation: string;
  commentary?: string;
}

export interface ParsedCounsel {
  isStructured: boolean;
  intro?: string;
  mirror?: string;
  shloka?: ParsedShloka;
  example?: string;
  sadhana?: string;
  rawText: string;
}

export function parseCounsel(text: string): ParsedCounsel {
  if (!text || typeof text !== 'string') {
    return { isStructured: false, rawText: '' };
  }

  // Regex matching headings like:
  // ### The Mirror, **The Mirror**, ### 1. The Mirror, **The Eternal Shloka**, etc.
  const headerRegex = /(?:^|\n)(?:#{1,4}\s*|\*{2}\s*)(?:(?:\d+\.\s*)?The\s+)?(Mirror|Eternal\s+Shloka|Living\s+Example|Micro-?Sadhana)[\s*#:]*(\n|$)/gi;
  const matches = [...text.matchAll(headerRegex)];

  if (matches.length === 0) {
    return { isStructured: false, rawText: text };
  }

  const sections: {
    intro: string;
    mirror: string;
    shlokaRaw: string;
    example: string;
    sadhana: string;
  } = {
    intro: text.substring(0, matches[0].index).trim(),
    mirror: '',
    shlokaRaw: '',
    example: '',
    sadhana: '',
  };

  for (let i = 0; i < matches.length; i++) {
    const current = matches[i];
    const keyName = current[1].toLowerCase().replace(/[^a-z]/g, '');
    const startIndex = (current.index || 0) + current[0].length;
    const endIndex = i + 1 < matches.length ? (matches[i + 1].index || text.length) : text.length;
    const content = text.substring(startIndex, endIndex).trim();

    if (keyName.includes('mirror')) {
      sections.mirror = content;
    } else if (keyName.includes('shloka')) {
      sections.shlokaRaw = content;
    } else if (keyName.includes('example')) {
      sections.example = content;
    } else if (keyName.includes('sadhana')) {
      sections.sadhana = content;
    }
  }

  // Parse Shloka section details
  let shlokaParsed: ParsedShloka | undefined = undefined;
  if (sections.shlokaRaw) {
    let reference = 'Bhagavad Gita';
    let sanskrit = '';
    let transliteration = '';
    let translation = '';
    let commentary = '';

    const lines = sections.shlokaRaw
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    // Look for reference e.g., (Chapter 2, Verse 47) or Chapter 2, Verse 47
    const refMatch = sections.shlokaRaw.match(
      /\(?Chapter\s+\d+[^)]*Verse\s+\d+\)?|BG\s+\d+[\.:]\d+|Bhagavad\s+Gita\s+\d+[\.:]\d+/i,
    );
    if (refMatch) {
      reference = refMatch[0].replace(/[()]/g, '').trim();
    }

    const devanagariLines: string[] = [];
    const transLines: string[] = [];
    let inTranslation = false;
    let inCommentary = false;

    for (const line of lines) {
      if (/^translation[:\s]/i.test(line)) {
        inTranslation = true;
        inCommentary = false;
        const t = line.replace(/^translation[:\s]*/i, '').trim();
        if (t) transLines.push(t);
        continue;
      }
      if (/^commentary[:\s]/i.test(line)) {
        inCommentary = true;
        inTranslation = false;
        const c = line.replace(/^commentary[:\s]*/i, '').trim();
        if (c) commentary += (commentary ? ' ' : '') + c;
        continue;
      }
      if (refMatch && line.includes(refMatch[0])) {
        continue;
      }

      // Check for Devanagari script (Sanskrit)
      if (/[\u0900-\u097F]/.test(line)) {
        devanagariLines.push(line.replace(/^["]|["]$/g, ''));
      } else if (inTranslation) {
        transLines.push(line.replace(/^["]|["]$/g, ''));
      } else if (inCommentary) {
        commentary += (commentary ? ' ' : '') + line;
      } else if (!sanskrit && line.startsWith('"') && line.endsWith('"') && line.length < 120) {
        devanagariLines.push(line.replace(/^["]|["]$/g, ''));
      } else {
        transLines.push(line);
      }
    }

    sanskrit = devanagariLines.join('\n') || 'कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।';
    translation =
      transLines.join(' ').replace(/^["]|["]$/g, '') || sections.shlokaRaw;

    shlokaParsed = {
      reference,
      sanskrit,
      transliteration,
      translation,
      commentary,
    };
  }

  return {
    isStructured: true,
    intro: sections.intro,
    mirror: sections.mirror,
    shloka: shlokaParsed,
    example: sections.example,
    sadhana: sections.sadhana,
    rawText: text,
  };
}
