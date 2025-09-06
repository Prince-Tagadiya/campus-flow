import { AI_CONFIG } from '../config/aiConfig';
import * as pdfjsLib from 'pdfjs-dist';
import { OCRService } from './ocrService';

// Configure pdfjs-dist worker to use local file
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

// PDF text extraction service
export class PDFService {
  static async extractTextFromPDF(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          console.log('Processing PDF file:', file.name, 'Size:', file.size);
          const arrayBuffer = e.target?.result as ArrayBuffer;
          
          // Try to extract text using pdfjs-dist first
          console.log('Attempting PDF.js text extraction...');
          const extractedText = await this.extractTextFromPDFBuffer(arrayBuffer);
          
          if (extractedText && extractedText.trim().length > 0) {
            console.log('PDF.js extraction successful. Text length:', extractedText.length);
            resolve(extractedText);
          } else {
            // If no text found, try OCR on PDF as image
            console.log('No text found in PDF, trying OCR...');
            const ocrResult = await this.extractTextFromPDFAsImage(file);
            console.log('OCR extraction successful. Text length:', ocrResult.text.length);
            resolve(ocrResult.text);
          }
        } catch (error) {
          console.error('PDF parsing error:', error);
          // If PDF.js fails completely, try direct OCR fallback
          console.log('PDF.js failed, trying direct OCR fallback...');
          try {
            const fallbackResult = await this.extractTextFromPDFDirectOCR(file);
            console.log('Direct OCR fallback successful. Text length:', fallbackResult.length);
            resolve(fallbackResult);
          } catch (fallbackError) {
            console.error('All PDF extraction methods failed:', fallbackError);
            reject(new Error(`Failed to extract text from PDF: ${error instanceof Error ? error.message : 'Unknown error'}. Please try a different file or enter details manually.`));
          }
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read PDF file'));
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Extract text from PDF using pdfjs-dist
   */
  private static async extractTextFromPDFBuffer(arrayBuffer: ArrayBuffer): Promise<string> {
    try {
      console.log('Loading PDF document...');
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      console.log('PDF loaded. Pages:', pdf.numPages);
      
      let fullText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        console.log(`Processing page ${i}/${pdf.numPages}...`);
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        fullText += pageText + '\n';
      }

      console.log('PDF.js extraction completed. Total text length:', fullText.length);
      return fullText.trim();
    } catch (error) {
      console.error('PDF.js extraction failed:', error);
      return '';
    }
  }

  /**
   * Extract text from PDF as image using OCR
   */
  private static async extractTextFromPDFAsImage(file: File): Promise<{ text: string; confidence: number }> {
    try {
      // Convert PDF to image using canvas
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      // Get the first page as image
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 2.0 }); // Higher scale for better OCR
      
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      if (!context) {
        throw new Error('Failed to get canvas context');
      }

      await page.render({
        canvasContext: context,
        viewport: viewport,
        canvas: canvas
      }).promise;

      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob!);
        }, 'image/png');
      });

      // Use OCR to extract text from the image
      const ocrResult = await OCRService.extractTextFromImage(new File([blob], 'pdf-page.png', { type: 'image/png' }));
      
      return {
        text: ocrResult.text,
        confidence: ocrResult.confidence
      };
    } catch (error) {
      console.error('PDF to image OCR failed:', error);
      throw new Error('Failed to extract text from PDF using OCR');
    }
  }

  /**
   * Extract text from image file using OCR
   */
  static async extractTextFromImage(file: File): Promise<string> {
    try {
      const ocrResult = await OCRService.extractTextFromImage(file);
      return ocrResult.text;
    } catch (error) {
      console.error('Image OCR extraction failed:', error);
      throw new Error('Failed to extract text from image. Please try a clearer image or different file.');
    }
  }

  /**
   * Extract text from any supported file (PDF or image)
   */
  static async extractTextFromFile(file: File): Promise<string> {
    console.log('Extracting text from file:', file.name, 'Type:', file.type, 'Size:', file.size);
    
    if (file.type === 'application/pdf') {
      return this.extractTextFromPDF(file);
    } else if (OCRService.getSupportedImageTypes().includes(file.type)) {
      return this.extractTextFromImage(file);
    } else {
      throw new Error('Unsupported file type. Please select a PDF or image file.');
    }
  }

  /**
   * Direct OCR fallback for PDFs when PDF.js fails
   */
  private static async extractTextFromPDFDirectOCR(file: File): Promise<string> {
    try {
      console.log('Using direct OCR fallback for PDF...');
      // For now, return a message indicating OCR is not available for PDFs without PDF.js
      // In a real implementation, you could use a different PDF-to-image library
      throw new Error('PDF processing requires PDF.js. Please try with an image file instead.');
    } catch (error) {
      console.error('Direct OCR fallback failed:', error);
      throw error;
    }
  }

  /**
   * Simple test method for debugging
   */
  static async testOCRWithImage(file: File): Promise<string> {
    console.log('Testing OCR with image file:', file.name);
    try {
      const result = await OCRService.extractTextFromImage(file);
      console.log('OCR test successful:', result);
      return result.text;
    } catch (error) {
      console.error('OCR test failed:', error);
      throw error;
    }
  }

  static validatePDFFile(file: File): { valid: boolean; error?: string } {
    if (!file) {
      return { valid: false, error: 'No file selected' };
    }

    if (file.type !== 'application/pdf') {
      return { valid: false, error: 'Please select a PDF file' };
    }

    if (file.size > AI_CONFIG.MAX_PDF_SIZE) {
      return { valid: false, error: `File size too large. Please select a file under ${AI_CONFIG.MAX_PDF_SIZE / (1024 * 1024)}MB.` };
    }

    return { valid: true };
  }

  /**
   * Validate any supported file (PDF or image)
   */
  static validateFile(file: File): { valid: boolean; error?: string } {
    if (!file) {
      return { valid: false, error: 'No file selected' };
    }

    // Check if it's a PDF
    if (file.type === 'application/pdf') {
      return this.validatePDFFile(file);
    }

    // Check if it's a supported image
    if (OCRService.getSupportedImageTypes().includes(file.type)) {
      return OCRService.validateImageFile(file);
    }

    return { 
      valid: false, 
      error: 'Please select a PDF file or supported image (JPG, PNG, GIF, BMP, WebP)' 
    };
  }
}
