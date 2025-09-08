import { GoogleGenerativeAI } from '@google/generative-ai';
import { AI_CONFIG } from '../config/aiConfig';

// Initialize Google Gemini client
const genAI = new GoogleGenerativeAI(AI_CONFIG.GEMINI_API_KEY);

export interface AIExtractedAssignment {
  title: string;
  description: string;
  deadline?: string;
  subject?: string;
  priority?: 'high' | 'medium' | 'low';
  submissionType?: 'assignment' | 'tutorial' | 'project' | 'exam';
  instructions?: string;
  requirements?: string[];
  points?: number;
  confidence: number;
  missingFields?: string[]; // Fields that need manual completion
}

export class AIService {
  // Exam extraction types
  static async extractExamSchedule(pdfText: string): Promise<Array<{ subjectName: string; examDate: string; startTime: string; endTime: string }>> {
    try {
      if (!AI_CONFIG.GEMINI_API_KEY || AI_CONFIG.GEMINI_API_KEY === 'your-gemini-api-key-here') {
        console.log('No Gemini API key found, using fallback exam extraction');
        return this.fallbackExamExtraction(pdfText);
      }

      const model = genAI.getGenerativeModel({ model: AI_CONFIG.MODEL });
      const prompt = `
You are an expert academic scheduler. From the raw text of a university exam timetable, extract EVERY exam as clean, normalized entries.

STRICT RULES:
1) Return ONLY a valid JSON array (no markdown, no prose, no trailing commas)
2) Fields: subjectName, examDate (YYYY-MM-DD), startTime (HH:MM 24h), endTime (HH:MM 24h)
3) Clean noisy titles (e.g., remove codes/suffixes) but keep meaningful names
4) Ignore rows lacking a valid date and both start/end times
5) Fix common OCR artifacts (O->0, l->1 where obvious in times)
6) Ensure startTime < endTime; discard invalid entries
7) Do not guess ambiguous DD/MM vs MM/DD; prefer ISO like 2025-04-12 only when unambiguous

EXAMPLE RESPONSE:
[
  {"subjectName":"Mathematics","examDate":"2025-03-21","startTime":"09:00","endTime":"11:00"}
]

SOURCE TEXT:\n${pdfText.substring(0, 7000)}
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text().trim();
      if (text.startsWith('```')) text = text.replace(/^```json?\s*/i, '').replace(/\s*```\s*$/i, '');
      if (!(text.startsWith('[') && text.endsWith(']'))) {
        const match = text.match(/\[[\s\S]*\]/);
        if (match) text = match[0];
      }
      const data = JSON.parse(text);
      if (!Array.isArray(data)) return this.fallbackExamExtraction(pdfText);
      const cleaned = data
        .map((e: any) => ({
          subjectName: typeof e.subjectName === 'string' ? e.subjectName.trim() : '',
          examDate: this.validateDate(e.examDate) || '',
          startTime: this.validateTime(e.startTime) || '',
          endTime: this.validateTime(e.endTime) || '',
        }))
        .filter(e => e.subjectName && e.examDate && e.startTime && e.endTime);
      if (cleaned.length === 0) return this.fallbackExamExtraction(pdfText);
      return cleaned;
    } catch (err) {
      console.warn('Gemini exam extraction failed, falling back. Error:', err);
      return this.fallbackExamExtraction(pdfText);
    }
  }
  static async extractAssignmentDetails(pdfText: string): Promise<AIExtractedAssignment> {
    try {
      // Check if we have a valid API key
      if (!AI_CONFIG.GEMINI_API_KEY || AI_CONFIG.GEMINI_API_KEY === 'your-gemini-api-key-here') {
        console.log('No Gemini API key found, using fallback extraction');
        return this.fallbackExtraction(pdfText);
      }

      console.log('Using Google Gemini API for assignment extraction...');

      let model = genAI.getGenerativeModel({ model: AI_CONFIG.MODEL });

      const prompt = `
You are an expert academic document analyzer. Extract assignment information and create CLEAN, ORGANIZED summaries.

CRITICAL RULES:
1. Return ONLY valid JSON - no explanations, no markdown
2. Create BRIEF, CLEAR summaries - NOT the full document text
3. If information is missing, use null
4. Convert dates to YYYY-MM-DD format
5. Extract requirements as clean array items
6. List missing fields that need manual completion

REQUIRED JSON STRUCTURE:
{
  "title": "string - Clean assignment title (e.g., 'Assignment 1: Data Structures', 'Lab Report 3')",
  "description": "string - 1-2 sentence summary of what the assignment asks for",
  "deadline": "string - Due date in YYYY-MM-DD format or null",
  "subject": "string - Course name/code or null",
  "priority": "string - high/medium/low based on urgency",
  "submissionType": "string - assignment/tutorial/project/exam",
  "instructions": "string - Key instructions in 1-2 sentences or null",
  "requirements": ["array of strings - Main requirements only"],
  "points": "number - Total points if mentioned or null",
  "confidence": "number - 0.1 to 1.0 confidence score",
  "missingFields": ["array of strings - Fields that need manual completion"]
}

EXTRACTION GUIDELINES:
- Title: Extract clean title like "Assignment 1", "Project Report", "Lab 3: Algorithms"
- Description: Write 1-2 sentences summarizing what students need to do
- Instructions: Extract main task requirements in 1-2 sentences
- Requirements: Only include major deliverables, not every detail
- Missing Fields: List fields that couldn't be extracted (e.g., ["deadline", "points"])
- Confidence: 0.8+ if very clear, 0.5-0.7 if somewhat clear, 0.1-0.4 if unclear

EXAMPLES:
Title: "Assignment 1: Binary Search Trees" (not "CS 201 Assignment 1 Binary Search Trees Implementation")
Description: "Implement a binary search tree with insert, delete, and search operations" (not the full document)
Instructions: "Write a C++ program that implements BST operations and test with provided data" (not all details)

DOCUMENT TEXT TO ANALYZE:
${pdfText.substring(0, 6000)}
      `;

      let result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      console.log('Gemini Response:', text);

      // Clean the response to extract JSON
      let jsonText = text.trim();

      // Remove markdown code fences if present
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/^```json\s*/i, '').replace(/\s*```\s*$/i, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/^```\s*/i, '').replace(/\s*```\s*$/i, '');
      }

      // If response still includes extra prose, try to extract the first JSON object
      if (!(jsonText.trim().startsWith('{') && jsonText.trim().endsWith('}'))) {
        const match = jsonText.match(/\{[\s\S]*\}/);
        if (match) jsonText = match[0];
      }

      // Parse the JSON response (may throw)
      const extracted = JSON.parse(jsonText);
      
      console.log('Parsed Gemini data:', extracted);
      
      // Validate and clean the response with better defaults
      const extractedAssignment = {
        title: this.enforceTitle(this.cleanText(extracted.title), pdfText) || 'Untitled Assignment',
        description: this.enforceSummary(this.cleanText(extracted.description), pdfText, extracted.requirements) || 'No description available',
        deadline: this.validateDate(extracted.deadline),
        subject: this.cleanText(extracted.subject),
        priority: this.validatePriority(extracted.priority),
        submissionType: this.validateSubmissionType(extracted.submissionType),
        instructions: this.clampText(this.cleanText(extracted.instructions), 280),
        requirements: this.clampRequirements(this.validateRequirements(extracted.requirements)),
        points: this.validatePoints(extracted.points),
        confidence: Math.min(Math.max(extracted.confidence || 0.5, 0), 1),
        missingFields: this.validateMissingFields(extracted.missingFields)
      };

      // Auto-detect missing fields if not provided by AI
      if (!extractedAssignment.missingFields || extractedAssignment.missingFields.length === 0) {
        extractedAssignment.missingFields = this.detectMissingFields(extractedAssignment);
      }

      return extractedAssignment;

    } catch (error: any) {
      const errMsg = String(error?.message || error);
      const is429 = errMsg.includes('429') || errMsg.toLowerCase().includes('quota');
      if (is429 && AI_CONFIG.FALLBACK_MODEL) {
        try {
          console.warn('429/quota hit. Retrying once with fallback model and reduced input...');
          const trimmedText = pdfText.substring(0, Math.min(3000, pdfText.length));
          const fbModel = genAI.getGenerativeModel({ model: AI_CONFIG.FALLBACK_MODEL });
          const prompt = `
You are an academic document analyzer. Return ONLY JSON with these fields: title, description, deadline, subject, priority, submissionType, instructions, requirements, points, confidence, missingFields. Keep description to 1-2 sentences.

TEXT:\n${trimmedText}
          `;
          const retried = await fbModel.generateContent(prompt);
          const response = await retried.response;
          const text = response.text();
          let jsonText = text.trim();
          if (jsonText.startsWith('```')) jsonText = jsonText.replace(/^```json?\s*/i, '').replace(/\s*```\s*$/i, '');
          if (!(jsonText.trim().startsWith('{') && jsonText.trim().endsWith('}'))) {
            const match = jsonText.match(/\{[\s\S]*\}/);
            if (match) jsonText = match[0];
          }
          const extracted = JSON.parse(jsonText);
          const extractedAssignment = {
            title: this.enforceTitle(this.cleanText(extracted.title), trimmedText) || 'Untitled Assignment',
            description: this.enforceSummary(this.cleanText(extracted.description), trimmedText, extracted.requirements) || 'No description available',
            deadline: this.validateDate(extracted.deadline),
            subject: this.cleanText(extracted.subject),
            priority: this.validatePriority(extracted.priority),
            submissionType: this.validateSubmissionType(extracted.submissionType),
            instructions: this.clampText(this.cleanText(extracted.instructions), 280),
            requirements: this.clampRequirements(this.validateRequirements(extracted.requirements)),
            points: this.validatePoints(extracted.points),
            confidence: Math.min(Math.max(extracted.confidence || 0.5, 0), 1),
            missingFields: this.validateMissingFields(extracted.missingFields)
          };
          if (!extractedAssignment.missingFields || extractedAssignment.missingFields.length === 0) {
            extractedAssignment.missingFields = this.detectMissingFields(extractedAssignment);
          }
          return extractedAssignment;
        } catch (retryErr) {
          console.error('Retry with fallback model failed:', retryErr);
        }
      }

      console.error('Error extracting assignment details with Gemini:', error);
      console.log('Falling back to local extraction');
      return this.fallbackExtraction(pdfText);
    }
  }

  private static fallbackExtraction(pdfText: string): AIExtractedAssignment {
    // Simple pattern matching for common assignment formats
    const rawLines = pdfText.split('\n');
    const lines = rawLines.map(line => line.replace(/\s+/g, ' ').trim()).filter(line => line.length > 0);

    let title = 'Untitled Assignment';
    let description = 'No description available';
    let deadline = null;
    let subject = null;
    let priority = 'medium';
    let submissionType = 'assignment';
    let instructions = null;
    let requirements: string[] = [];
    let points = null;
    let confidence = 0.7;

    // Extract title - broaden patterns and allow no colon
    const titleLine =
      // Common keywords with or without numbering
      lines.find(l => /(assignment|project|homework|lab|report|sheet)\b/i.test(l)) ||
      // Heading style: very short line in title case or ALL CAPS (excluding obvious headers)
      lines.find(l => l.length <= 80 && (/^[A-Z0-9][A-Z0-9 \-_:]{4,}$/.test(l) || /^[A-Z][a-z0-9].{2,}$/.test(l)) && !/(university|faculty|department|course|semester)/i.test(l)) ||
      // Fallback to the first non-empty line
      lines[0];

    if (titleLine) {
      // Prefer known keyword spans like "Assignment 1", "Lab 3", "Project"
      const keyword = titleLine.match(/(assignment\s*\d*[A-Za-z]*|lab\s*\d*[A-Za-z]*|project\s*[A-Za-z0-9\-]*|homework\s*\d*|report\s*\d*|sheet\s*\d*)/i);
      title = (keyword ? keyword[1] : titleLine)
        .replace(/^(title|subject)\s*[:\-]\s*/i, '')
        .replace(/\s{2,}/g, ' ')
        .trim();
      if (title.length > 80) title = title.slice(0, 80).replace(/\s+\S*$/, '');
      // Capitalize first letter
      title = title.charAt(0).toUpperCase() + title.slice(1);
    }

    // Extract deadline with stronger patterns and normalize to YYYY-MM-DD when possible
    const datePatterns = [
      /(\d{4}-\d{2}-\d{2})/, // ISO
      /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/, // D/M/YYYY or M/D/YYYY
      /(?:on|by|due|deadline)\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
      /(?:on|by|due|deadline)\s*([A-Za-z]{3,9}\s+\d{1,2},?\s+\d{4})/i, // e.g., Sep 4, 2025
    ];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const l = line.toLowerCase();
      if (l.includes('due') || l.includes('deadline') || l.includes('date') || /\b(on|by)\b/.test(l)) {
        let matchedDate: string | undefined;
        for (const re of datePatterns) {
          const m = line.match(re);
          if (m) { matchedDate = m[1]; break; }
        }
        // If date isn't on the same line, check the next non-empty line
        if (!matchedDate && i + 1 < lines.length) {
          const next = lines[i + 1];
          for (const re of datePatterns) {
            const m2 = next.match(re);
            if (m2) { matchedDate = m2[1]; break; }
          }
        }
        if (matchedDate) {
          // Try ISO/known formats first
          const iso = this.validateDate(matchedDate);
          if (iso) { deadline = iso; break; }
          // Try to parse named month dates
          const monthName = matchedDate.match(/^([A-Za-z]{3,9})\s+(\d{1,2}),?\s+(\d{4})$/);
          if (monthName) {
            const monthMap: Record<string, number> = {jan:1,feb:2,mar:3,apr:4,may:5,jun:6,jul:7,aug:8,sep:9,sept:9,oct:10,nov:11,dec:12};
            const mm = monthMap[monthName[1].toLowerCase().slice(0,3)];
            const dayNum = parseInt(monthName[2],10);
            const yearNum = parseInt(monthName[3],10);
            if (mm) {
              const guess = `${yearNum}-${String(mm).padStart(2,'0')}-${String(dayNum).padStart(2,'0')}`;
              const iso2 = this.validateDate(guess);
              if (iso2) { deadline = iso2; break; }
            }
          }
          // If still not normalized, keep raw for UI confirmation
          deadline = matchedDate; break;
        }
      }
    }

    // If still no deadline, consider a standalone ISO date line as the deadline hint
    if (!deadline) {
      const isoStandalone = lines.find(l => /(deadline|due)/i.test(l) ? false : /(\d{4}-\d{2}-\d{2})/.test(l));
      if (isoStandalone) {
        const m = isoStandalone.match(/(\d{4}-\d{2}-\d{2})/);
        if (m) deadline = this.validateDate(m[1]) || m[1];
      }
    }

    // Extract subject
    const subjectMatch = lines.find(line => 
      line.toLowerCase().includes('subject:') ||
      line.toLowerCase().includes('course:') ||
      line.toLowerCase().includes('class:')
    );
    if (subjectMatch) {
      subject = subjectMatch.replace(/^(subject|course|class):\s*/i, '').trim();
    }

    // Extract points
    const pointsMatch = lines.find(line => 
      line.toLowerCase().includes('points') ||
      line.toLowerCase().includes('marks') ||
      line.toLowerCase().includes('grade')
    );
    if (pointsMatch) {
      const pointsValue = pointsMatch.match(/(\d+)/);
      if (pointsValue) {
        points = parseInt(pointsValue[1]);
      }
    }

    // Extract requirements
    const reqStart = lines.findIndex(line => 
      line.toLowerCase().includes('requirements') ||
      line.toLowerCase().includes('instructions')
    );
    if (reqStart !== -1) {
      requirements = lines.slice(reqStart + 1, reqStart + 6)
        .filter(line => line.startsWith('-') || line.startsWith('•') || line.match(/^\d+\./))
        .map(line => line.replace(/^[-•\d.\s]+/, '').trim())
        .filter(line => line.length > 0);
    }

    // Determine submission type
    if (title.toLowerCase().includes('project')) {
      submissionType = 'project';
    } else if (title.toLowerCase().includes('exam') || title.toLowerCase().includes('test')) {
      submissionType = 'exam';
    } else if (title.toLowerCase().includes('tutorial')) {
      submissionType = 'tutorial';
    }

    // Determine priority based on deadline
    if (deadline) {
      const dueDate = new Date(deadline);
      const now = new Date();
      const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysUntilDue <= 3) {
        priority = 'high';
      } else if (daysUntilDue <= 7) {
        priority = 'medium';
      } else {
        priority = 'low';
      }
    }

    // Create description from first few meaningful lines after title
    const titleIndex = lines.findIndex(l => l === titleLine);
    const candidateWindow = lines.slice(Math.max(0, titleIndex + 1), titleIndex + 6);
    const descLines = candidateWindow.filter(line => 
      !/(assignment|project|homework|lab|report|sheet)/i.test(line) &&
      !/^(title|subject)\s*[:\-]/i.test(line) &&
      !/(due|deadline|submission|date)/i.test(line) &&
      !/(university|faculty|department|course|semester|student)/i.test(line)
    ).slice(0, 2);
    if (descLines.length > 0) {
      description = descLines.join(' ');
      if (description.length > 220) description = description.slice(0, 220).replace(/\s+\S*$/, '');
    } else {
      // Fallback: use next lines even if noisy
      const fallbackDesc = candidateWindow.slice(0, 2).join(' ').trim();
      if (fallbackDesc) {
        description = fallbackDesc.length > 220 ? fallbackDesc.slice(0, 220).replace(/\s+\S*$/, '') : fallbackDesc;
      }
    }

    // Enrich description with auto summary: questions count and estimated writing time
    try {
      const questionIndicators = [
        /^(q\s*\d+)\b/i,
        /^question\s*\d+\b/i,
        /^(\d+)\s*[\).\-]\s+/,
        /^\*\s+/,
      ];
      let questions = 0;
      for (const line of lines) {
        if (questionIndicators.some((re) => re.test(line))) questions += 1;
      }
      // If none matched, try heuristic: lines ending with '?' as questions
      if (questions === 0) {
        questions = lines.filter((l) => /\?\s*$/.test(l)).length;
      }

      const defaultWpm = 25; // handwriting WPM estimate
      const wordsPerQuestion = 120; // rough average short-answer length
      const totalWords = pdfText.trim().split(/\s+/).filter(Boolean).length;
      const estimatedWords = questions >= 2 ? questions * wordsPerQuestion : Math.max(200, Math.min(totalWords, 1500));
      const minutes = Math.max(5, Math.ceil(estimatedWords / defaultWpm));

      const marksHints = lines.filter((l) => /(\d+)\s*marks?\b/i.test(l));
      const marksNote = marksHints.length > 0 ? ' Includes mark allocations.' : '';

      const questionPart = questions >= 2 ? `Detected ${questions} question(s). ` : '';
      const autoSummary = `${questionPart}Estimated writing time ~${minutes} min at ${defaultWpm} wpm.${marksNote}`.trim();
      const hasSummaryAlready = /Estimated writing time ~\d+ min/.test(description) || /Detected \d+ question\(s\)/.test(description);
      if (!description || description === 'No description available') {
        description = autoSummary;
      } else if (!hasSummaryAlready) {
        const sep = description.endsWith('.') ? ' ' : '. ';
        description = `${description}${sep}${autoSummary}`;
      }
    } catch {}

    const result = {
      title,
      description,
      deadline: deadline || undefined,
      subject: subject || undefined,
      priority: priority as 'high' | 'medium' | 'low',
      submissionType: submissionType as 'assignment' | 'tutorial' | 'project' | 'exam',
      instructions: instructions || undefined,
      requirements,
      points: points || undefined,
      confidence,
      missingFields: [] as string[]
    };

    // Detect missing fields for fallback
    result.missingFields = this.detectMissingFields(result);
    
    return result;
  }

  static async extractTextFromFile(file: File): Promise<string> {
    // Import PDFService here to avoid circular dependency
    const { PDFService } = await import('./pdfService');
    return PDFService.extractTextFromFile(file);
  }

  // Helper methods for data validation and cleaning
  private static cleanText(text: any): string | undefined {
    if (!text || typeof text !== 'string') return undefined;
    return text.trim().replace(/\s+/g, ' ');
  }

  // Keep titles short, remove leading noise and clamp length
  private static enforceTitle(title: string | undefined, source: string): string | undefined {
    if (!title) return undefined;
    let t = title
      .replace(/^title\s*[:\-]\s*/i, '')
      .replace(/\s{2,}/g, ' ')
      .trim();
    // Prefer patterns like "Assignment X", "Project", "Lab", if present in title
    const m = t.match(/(assignment\s*\d+[^\n]*|lab\s*\d+[^\n]*|project[^\n]*|homework\s*\d+[^\n]*)/i);
    if (m) t = m[1].trim();
    // Clamp
    if (t.length > 80) t = t.slice(0, 80).replace(/\s+\S*$/, '');
    return t;
  }

  // Ensure description is a short summary (1–2 sentences, <= 220 chars)
  private static enforceSummary(desc: string | undefined, source: string, reqs: any): string | undefined {
    const clamp = (s: string) => (s.length > 220 ? s.slice(0, 220).replace(/\s+\S*$/, '') : s);
    if (desc && desc.split(/[.!?]/).filter(s => s.trim()).length >= 1) {
      const firstTwo = desc.match(/([^.!?]*[.!?])\s*([^.!?]*[.!?])?/);
      if (firstTwo) return clamp((firstTwo[1] + (firstTwo[2] || '')).trim());
      return clamp(desc.trim());
    }
    // Build minimal summary from source if model returned long/empty text
    const firstLines = source
      .split(/\n+/)
      .map(l => l.trim())
      .filter(l => l && !/^subject\s*:/i.test(l) && !/^(deadline|due)\s*:/i.test(l))
      .slice(0, 3)
      .join(' ');
    return clamp(firstLines || 'Assignment details summarized from document');
  }

  private static clampText(text: string | undefined, maxLen: number): string | undefined {
    if (!text) return undefined;
    const t = text.trim();
    if (t.length <= maxLen) return t;
    return t.slice(0, maxLen).replace(/\s+\S*$/, '');
  }

  private static validateTime(time: any): string | undefined {
    if (!time || typeof time !== 'string') return undefined;
    const t = time.trim();
    // Accept HH:MM or H:MM 24-hour
    const m = t.match(/^(\d{1,2}):(\d{2})$/);
    if (!m) return undefined;
    const h = parseInt(m[1], 10);
    const mm = parseInt(m[2], 10);
    if (h < 0 || h > 23 || mm < 0 || mm > 59) return undefined;
    return `${String(h).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
  }

  private static clampRequirements(reqs: string[]): string[] {
    const max = 6;
    const clamped = reqs.slice(0, max).map(r => (r.length > 180 ? r.slice(0, 180).replace(/\s+\S*$/, '') : r));
    return clamped;
  }

  private static validateDate(date: any): string | undefined {
    if (!date || typeof date !== 'string') return undefined;
    
    // Check if it's already in YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      const year = parseInt(date.slice(0, 4), 10);
      const currentYear = new Date().getFullYear();
      if (year < 2000 || year > currentYear + 3) return undefined;
      return date;
    }
    
    // Try to parse other date formats
    // Accept unambiguous dd/mm/yyyy or mm/dd/yyyy by checking if one of the parts > 12
    const slashFormat = date.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
    if (slashFormat) {
      const part1 = parseInt(slashFormat[1], 10);
      const part2 = parseInt(slashFormat[2], 10);
      const y = slashFormat[3];
      if (y.length !== 4) return undefined; // force user confirmation
      const year = parseInt(y, 10);
      const currentYear = new Date().getFullYear();
      if (year < 2000 || year > currentYear + 3) return undefined;
      // If either part exceeds 12, we can safely infer order
      let day: number | undefined;
      let month: number | undefined;
      if (part1 > 12 && part2 <= 12) {
        day = part1; month = part2;
      } else if (part2 > 12 && part1 <= 12) {
        day = part2; month = part1;
      } else {
        // ambiguous like 05/06/2025 -> let UI confirm
        return undefined;
      }
      if (month < 1 || month > 12 || day < 1 || day > 31) return undefined;
      const iso = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const test = new Date(iso);
      if (!isNaN(test.getTime())) return iso;
      return undefined;
    }

    const parsed = new Date(date);
    if (!isNaN(parsed.getTime())) {
      const iso = parsed.toISOString().split('T')[0];
      const year = parseInt(iso.slice(0, 4), 10);
      const currentYear = new Date().getFullYear();
      if (year < 2000 || year > currentYear + 3) return undefined;
      return iso;
    }
    
    return undefined;
  }

  private static validatePriority(priority: any): 'high' | 'medium' | 'low' {
    if (!priority || typeof priority !== 'string') return 'medium';
    const p = priority.toLowerCase();
    if (p === 'high' || p === 'medium' || p === 'low') return p;
    return 'medium';
  }

  private static validateSubmissionType(type: any): 'assignment' | 'tutorial' | 'project' | 'exam' {
    if (!type || typeof type !== 'string') return 'assignment';
    const t = type.toLowerCase();
    if (t === 'assignment' || t === 'tutorial' || t === 'project' || t === 'exam') {
      return t as 'assignment' | 'tutorial' | 'project' | 'exam';
    }
    return 'assignment';
  }

  private static validateRequirements(requirements: any): string[] {
    if (!Array.isArray(requirements)) return [];
    return requirements
      .filter(req => req && typeof req === 'string')
      .map(req => req.trim())
      .filter(req => req.length > 0);
  }

  private static validatePoints(points: any): number | undefined {
    if (typeof points === 'number') return points;
    if (typeof points === 'string') {
      const num = parseInt(points.replace(/\D/g, ''), 10);
      return isNaN(num) ? undefined : num;
    }
    return undefined;
  }

  private static validateMissingFields(missingFields: any): string[] {
    if (!Array.isArray(missingFields)) return [];
    return missingFields
      .filter(field => field && typeof field === 'string')
      .map(field => field.trim())
      .filter(field => field.length > 0);
  }

  private static detectMissingFields(result: AIExtractedAssignment): string[] {
    const missing: string[] = [];
    
    if (!result.deadline) missing.push('deadline');
    if (!result.subject) missing.push('subject');
    if (!result.points) missing.push('points');
    if (!result.instructions) missing.push('instructions');
    if (!result.requirements || result.requirements.length === 0) missing.push('requirements');
    
    return missing;
  }

  // Fallback: more robust parse for exams handling common real-world formats
  private static fallbackExamExtraction(text: string): Array<{ subjectName: string; examDate: string; startTime: string; endTime: string }> {
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const exams: Array<{ subjectName: string; examDate: string; startTime: string; endTime: string }> = [];

    // Normalize dashes and spaces
    const normalize = (s: string) => s.replace(/[–—]/g, '-').replace(/\s+/g, ' ').trim();

    // Patterns:
    // 1) ISO date: 2025-03-21 09:00 - 11:00
    const isoPattern = /(\d{4}-\d{2}-\d{2})\s+(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/;

    // 2) Slash date with 4-digit year (DD/MM/YYYY or MM/DD/YYYY) + 24h time
    const slash24hPattern = /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})\s+(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/i;

    // 3) Slash date with 4-digit year + 12h with AM/PM
    const ampm = '(?:am|pm|a\\.m\\.|p\\.m\\.)';
    const slash12hPattern = new RegExp(`(\\d{1,2}[\\/\\-]\\d{1,2}[\\/\\-]\\d{4})\\s+(\\d{1,2}[:.]\\d{2}|\\d{1,2})\\s*(${ampm})?\\s*(?:-|to)\\s*(\\d{1,2}[:.]\\d{2}|\\d{1,2})\\s*(${ampm})?`, 'i');

    // 4) Month name formats: 04 Sep 2025 or Sep 04, 2025
    const monthNames = '(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec|January|February|March|April|June|July|August|September|October|November|December)';
    const dmyMonthPattern = new RegExp(`(\\d{1,2})\\s+${monthNames}\\s+(\\d{4})`, 'i');
    const mdyMonthPattern = new RegExp(`${monthNames}\\s+(\\d{1,2})(?:,)?\\s+(\\d{4})`, 'i');

    // Generic time range pattern: supports 9, 09, 9:00, 09:00, 9.00, with optional AM/PM and separators '-' or 'to'
    const timeChunk = '(?:\\d{1,2}(?::|\\.)?\\d{0,2})';
    const timeRangePattern = new RegExp(`(${timeChunk})\\s*(${ampm})?\\s*(?:-|to)\\s*(${timeChunk})\\s*(${ampm})?`, 'i');

    const to24h = (time: string, meridiem?: string): string | undefined => {
      const cleaned = time.replace('.', ':');
      const m = cleaned.match(/^(\d{1,2})(?::(\d{2}))?$/);
      if (!m) return undefined;
      let h = parseInt(m[1], 10);
      const mm = m[2] ? parseInt(m[2], 10) : 0;
      if (mm < 0 || mm > 59) return undefined;
      const md = (meridiem || '').toLowerCase();
      if (md.includes('pm') && h < 12) h += 12;
      if (md.includes('am') && h === 12) h = 0;
      if (h < 0 || h > 23) return undefined;
      return `${String(h).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
    };

    const toIso = (day: number, month: number, year: number): string | undefined => {
      if (year < 2000 || year > new Date().getFullYear() + 3) return undefined;
      if (month < 1 || month > 12) return undefined;
      if (day < 1 || day > 31) return undefined;
      return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    };

    const monthToNum = (m: string): number | undefined => {
      const s = m.toLowerCase().slice(0, 3);
      const map: Record<string, number> = { jan:1, feb:2, mar:3, apr:4, may:5, jun:6, jul:7, aug:8, sep:9, oct:10, nov:11, dec:12 };
      return map[s];
    };

    for (let raw of lines) {
      const line = normalize(raw);

      // Try ISO first
      let m = line.match(isoPattern);
      if (m) {
        const subjectName = line.slice(0, m.index).replace(/[-–|:]+$/,'').trim();
        const examDate = this.validateDate(m[1]) || '';
        const startTime = this.validateTime(m[2]) || '';
        const endTime = this.validateTime(m[3]) || '';
        if (subjectName && examDate && startTime && endTime) {
          exams.push({ subjectName, examDate, startTime, endTime });
          continue;
        }
      }

      // Try slash with 24h
      m = line.match(slash24hPattern);
      if (m) {
        const rawDate = m[1];
        const start = this.validateTime(m[2]) || '';
        const end = this.validateTime(m[3]) || '';
        // If ISO validation fails, keep the raw date so user can confirm/edit in UI
        const dateIso = this.validateDate(rawDate) || rawDate;
        const subjectName = line.slice(0, m.index).replace(/[-–|:]+$/,'').trim();
        if (subjectName && dateIso && start && end) {
          exams.push({ subjectName, examDate: dateIso, startTime: start, endTime: end });
          continue;
        }
      }

      // Try slash with 12h + AM/PM
      m = line.match(slash12hPattern);
      if (m) {
        const rawDate = m[1];
        const sTime = to24h(m[2], m[3]);
        const eTime = to24h(m[4], m[5]);
        const dateIso = this.validateDate(rawDate) || rawDate;
        const subjectName = line.slice(0, m.index).replace(/[-–|:]+$/,'').trim();
        if (subjectName && dateIso && sTime && eTime) {
          exams.push({ subjectName, examDate: dateIso, startTime: sTime, endTime: eTime });
          continue;
        }
      }

      // Try month name formats with generic time range
      let dm = line.match(dmyMonthPattern);
      if (dm) {
        const day = parseInt(dm[1], 10);
        const monthName = dm[0].split(/\s+/)[1];
        const month = monthToNum(monthName || '');
        const year = parseInt(dm[2], 10);
        const t = line.match(timeRangePattern);
        if (month && t) {
          const sTime = to24h(t[1], t[2]);
          const eTime = to24h(t[3], t[4]);
          const iso = toIso(day, month, year) || `${dm[0]}`;
          const subjectName = line.replace(dm[0], '').replace(t[0], '').replace(/[-–|:]+$/,'').trim();
          if (subjectName && iso && sTime && eTime) {
            exams.push({ subjectName, examDate: iso, startTime: sTime, endTime: eTime });
            continue;
          }
        }
      }

      dm = line.match(mdyMonthPattern);
      if (dm) {
        const monthName = dm[0].match(new RegExp(monthNames, 'i'))?.[0] || '';
        const month = monthToNum(monthName);
        const day = parseInt(dm[1], 10);
        const year = parseInt(dm[2], 10);
        const t = line.match(timeRangePattern);
        if (month && t) {
          const sTime = to24h(t[1], t[2]);
          const eTime = to24h(t[3], t[4]);
          const iso = toIso(day, month, year) || `${dm[0]}`;
          const subjectName = line.replace(dm[0], '').replace(t[0], '').replace(/[-–|:]+$/,'').trim();
          if (subjectName && iso && sTime && eTime) {
            exams.push({ subjectName, examDate: iso, startTime: sTime, endTime: eTime });
            continue;
          }
        }
      }

      // Generic catch-all: find any date token and any time range in the line
      const anyDate = line.match(/\d{4}-\d{2}-\d{2}|\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}/);
      const anyTime = line.match(timeRangePattern) as RegExpMatchArray | null;
      if (anyDate && anyTime) {
        const rawDate = anyDate[0];
        const sTime = to24h(anyTime[1], anyTime[2]);
        const eTime = to24h(anyTime[3], anyTime[4]);
        const dateIso = this.validateDate(rawDate) || rawDate;
        const subjectName = line.replace(rawDate, '').replace(anyTime[0], '').replace(/[-–|:]+$/,'').trim();
        if (subjectName && dateIso && sTime && eTime) {
          exams.push({ subjectName, examDate: dateIso, startTime: sTime, endTime: eTime });
          continue;
        }
      }
    }

    return exams;
  }

}
