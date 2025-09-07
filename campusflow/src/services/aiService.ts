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
  static async extractAssignmentDetails(pdfText: string): Promise<AIExtractedAssignment> {
    try {
      // Check if we have a valid API key
      if (!AI_CONFIG.GEMINI_API_KEY || AI_CONFIG.GEMINI_API_KEY === 'your-gemini-api-key-here') {
        console.log('No Gemini API key found, using fallback extraction');
        return this.fallbackExtraction(pdfText);
      }

      console.log('Using Google Gemini API for assignment extraction...');

      const model = genAI.getGenerativeModel({ model: AI_CONFIG.MODEL });

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

      const result = await model.generateContent(prompt);
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

    } catch (error) {
      console.error('Error extracting assignment details with Gemini:', error);
      console.log('Falling back to local extraction');
      return this.fallbackExtraction(pdfText);
    }
  }

  private static fallbackExtraction(pdfText: string): AIExtractedAssignment {
    // Simple pattern matching for common assignment formats
    const lines = pdfText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
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

    // Extract title (look for "Assignment:", "Project:", etc.)
    const titleMatch = lines.find(line => 
      line.toLowerCase().includes('assignment:') || 
      line.toLowerCase().includes('project:') ||
      line.toLowerCase().includes('homework:')
    );
    if (titleMatch) {
      title = titleMatch.replace(/^(assignment|project|homework):\s*/i, '').trim();
    }

    // Extract deadline
    const deadlineMatch = lines.find(line => 
      line.toLowerCase().includes('due') || 
      line.toLowerCase().includes('deadline') ||
      line.toLowerCase().includes('date')
    );
    if (deadlineMatch) {
      const dateMatch = deadlineMatch.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\d{4}-\d{2}-\d{2})/);
      if (dateMatch) {
        deadline = dateMatch[1];
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

    // Create description from first few lines
    const descLines = lines.slice(0, 3).filter(line => 
      !line.toLowerCase().includes('assignment') &&
      !line.toLowerCase().includes('due') &&
      !line.toLowerCase().includes('deadline')
    );
    if (descLines.length > 0) {
      description = descLines.join(' ');
    }

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

  private static clampRequirements(reqs: string[]): string[] {
    const max = 6;
    const clamped = reqs.slice(0, max).map(r => (r.length > 180 ? r.slice(0, 180).replace(/\s+\S*$/, '') : r));
    return clamped;
  }

  private static validateDate(date: any): string | undefined {
    if (!date || typeof date !== 'string') return undefined;
    
    // Check if it's already in YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
    
    // Try to parse other date formats
    const parsed = new Date(date);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString().split('T')[0];
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

}
