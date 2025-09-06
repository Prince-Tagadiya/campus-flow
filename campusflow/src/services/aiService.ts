import OpenAI from 'openai';
import { AI_CONFIG } from '../config/aiConfig';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: AI_CONFIG.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Only for client-side usage
});

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
}

export class AIService {
  static async extractAssignmentDetails(pdfText: string): Promise<AIExtractedAssignment> {
    try {
      // Check if we have a valid API key
      if (!AI_CONFIG.OPENAI_API_KEY || AI_CONFIG.OPENAI_API_KEY === 'your-openai-api-key-here') {
        console.log('No OpenAI API key found, using fallback extraction');
        return this.fallbackExtraction(pdfText);
      }

      console.log('Using ChatGPT API for assignment extraction...');

      const prompt = `
        You are an expert academic document analyzer. Analyze the following text extracted from an assignment document and extract key information with high accuracy.

        IMPORTANT: Return ONLY a valid JSON object with the exact structure below. Do not include any other text or explanations.

        {
          "title": "Assignment title (extract the main title/name of the assignment)",
          "description": "Brief description of what the assignment is about",
          "deadline": "Due date in YYYY-MM-DD format (convert any date format to this standard)",
          "subject": "Subject/course name (e.g., Mathematics, Computer Science, Physics)",
          "priority": "high/medium/low (high if due within 3 days, medium if within 2 weeks, low if more than 2 weeks)",
          "submissionType": "assignment/tutorial/project/exam (choose the most appropriate type)",
          "instructions": "Main instructions for completing the assignment",
          "requirements": ["List of specific requirements as separate array items"],
          "points": "Total points/grade if mentioned (extract number only)",
          "confidence": "0.1-1.0 confidence score based on how clear the information is"
        }

        EXTRACTION RULES:
        1. For title: Look for "Assignment", "Homework", "Project", "Lab" followed by a number or name
        2. For deadline: Convert any date format (MM/DD/YYYY, DD/MM/YYYY, "Due by", "Deadline", etc.) to YYYY-MM-DD
        3. For subject: Look for course codes, subject names, or department names
        4. For requirements: Extract each requirement as a separate array item
        5. For points: Extract only the numerical value
        6. If information is not found, use null for that field
        7. Be very accurate with confidence scores - only give high confidence (0.8+) if you're very certain

        Document text to analyze:
        ${pdfText.substring(0, 6000)}
      `;

      const completion = await openai.chat.completions.create({
        model: AI_CONFIG.MODEL,
        messages: [
          {
            role: "system",
            content: "You are an expert academic document analyzer. Your job is to extract assignment information from text and return it in a structured JSON format. Always return valid JSON with the exact structure requested. Be precise and accurate in your extractions."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: AI_CONFIG.TEMPERATURE,
        max_tokens: AI_CONFIG.MAX_TOKENS
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from AI');
      }

      console.log('AI Response:', response);

      // Clean the response to extract JSON
      let jsonText = response.trim();
      
      // Remove any markdown code blocks if present
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/```json\n?/, '').replace(/```\n?$/, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/```\n?/, '').replace(/```\n?$/, '');
      }

      // Parse the JSON response
      const extracted = JSON.parse(jsonText);
      
      console.log('Parsed AI data:', extracted);
      
      // Validate and clean the response with better defaults
      return {
        title: this.cleanText(extracted.title) || 'Untitled Assignment',
        description: this.cleanText(extracted.description) || 'No description available',
        deadline: this.validateDate(extracted.deadline),
        subject: this.cleanText(extracted.subject),
        priority: this.validatePriority(extracted.priority),
        submissionType: this.validateSubmissionType(extracted.submissionType),
        instructions: this.cleanText(extracted.instructions),
        requirements: this.validateRequirements(extracted.requirements),
        points: this.validatePoints(extracted.points),
        confidence: Math.min(Math.max(extracted.confidence || 0.5, 0), 1)
      };

    } catch (error) {
      console.error('Error extracting assignment details:', error);
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

    return {
      title,
      description,
      deadline: deadline || undefined,
      subject: subject || undefined,
      priority: priority as 'high' | 'medium' | 'low',
      submissionType: submissionType as 'assignment' | 'tutorial' | 'project' | 'exam',
      instructions: instructions || undefined,
      requirements,
      points: points || undefined,
      confidence
    };
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

}
