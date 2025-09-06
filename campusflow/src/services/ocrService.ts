import Tesseract from 'tesseract.js';

export interface OCRResult {
  text: string;
  confidence: number;
  processingTime: number;
}

export class OCRService {
  private static worker: Tesseract.Worker | null = null;
  private static isInitialized = false;

  /**
   * Initialize Tesseract.js worker
   */
  static async initialize(): Promise<void> {
    if (this.isInitialized && this.worker) {
      return;
    }

    try {
      console.log('Initializing Tesseract.js worker...');
      this.worker = await Tesseract.createWorker('eng');
      console.log('Tesseract.js worker created successfully');
      
      this.isInitialized = true;
      console.log('OCR Service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize OCR service:', error);
      throw new Error(`Failed to initialize OCR service: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Extract text from image using OCR
   */
  static async extractTextFromImage(imageFile: File): Promise<OCRResult> {
    const startTime = Date.now();
    
    try {
      console.log('Starting OCR extraction for file:', imageFile.name, 'Type:', imageFile.type);
      
      // Initialize if not already done
      if (!this.isInitialized) {
        console.log('OCR not initialized, initializing now...');
        await this.initialize();
      }

      if (!this.worker) {
        throw new Error('OCR worker not initialized');
      }

      console.log('Performing OCR recognition...');
      // Perform OCR
      const { data: { text, confidence } } = await this.worker.recognize(imageFile);
      
      const processingTime = Date.now() - startTime;
      
      console.log('OCR completed. Text length:', text.length, 'Confidence:', confidence, 'Time:', processingTime + 'ms');
      
      return {
        text: text.trim(),
        confidence: confidence / 100, // Convert to 0-1 scale
        processingTime
      };
    } catch (error) {
      console.error('OCR extraction failed:', error);
      throw new Error(`Failed to extract text from image: ${error instanceof Error ? error.message : 'Unknown error'}. Please try a clearer image or different file.`);
    }
  }

  /**
   * Extract text from image URL
   */
  static async extractTextFromImageUrl(imageUrl: string): Promise<OCRResult> {
    const startTime = Date.now();
    
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      if (!this.worker) {
        throw new Error('OCR worker not initialized');
      }

      const { data: { text, confidence } } = await this.worker.recognize(imageUrl);
      
      const processingTime = Date.now() - startTime;
      
      return {
        text: text.trim(),
        confidence: confidence / 100,
        processingTime
      };
    } catch (error) {
      console.error('OCR extraction from URL failed:', error);
      throw new Error('Failed to extract text from image URL');
    }
  }

  /**
   * Clean up OCR worker
   */
  static async terminate(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
      this.isInitialized = false;
      console.log('OCR Service terminated');
    }
  }

  /**
   * Validate image file
   */
  static validateImageFile(file: File): { valid: boolean; error?: string } {
    if (!file) {
      return { valid: false, error: 'No file selected' };
    }

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return { 
        valid: false, 
        error: 'Please select a valid image file (JPG, PNG, GIF, BMP, or WebP)' 
      };
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return { 
        valid: false, 
        error: `File size too large. Please select a file under ${maxSize / (1024 * 1024)}MB.` 
      };
    }

    return { valid: true };
  }

  /**
   * Get supported image types
   */
  static getSupportedImageTypes(): string[] {
    return ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp', 'image/webp'];
  }
}
