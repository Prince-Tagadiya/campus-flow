import React, { useState } from 'react';
import { OCRService } from '../services/ocrService';
import { PDFService } from '../services/pdfService';

const OCRTest: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>('');

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setExtractedText('');
      setError('');
    }
  };

  const handleExtractText = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setError('');

    try {
      const text = await PDFService.extractTextFromFile(selectedFile);
      setExtractedText(text);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImageExtract = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setError('');

    try {
      const result = await OCRService.extractTextFromImage(selectedFile);
      setExtractedText(result.text);
      console.log('OCR Confidence:', result.confidence);
      console.log('Processing Time:', result.processingTime, 'ms');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">OCR Test Component</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">File Upload</h2>
        
        <div className="mb-4">
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.gif,.bmp,.webp"
            onChange={handleFileSelect}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {selectedFile && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <p><strong>Selected File:</strong> {selectedFile.name}</p>
            <p><strong>Type:</strong> {selectedFile.type}</p>
            <p><strong>Size:</strong> {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
        )}

        <div className="flex space-x-4">
          <button
            onClick={handleExtractText}
            disabled={!selectedFile || isProcessing}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? 'Processing...' : 'Extract Text (PDF/Image)'}
          </button>
          
          <button
            onClick={handleImageExtract}
            disabled={!selectedFile || isProcessing}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? 'Processing...' : 'OCR Only (Image)'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800"><strong>Error:</strong> {error}</p>
        </div>
      )}

      {extractedText && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Extracted Text</h2>
          <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
            <pre className="whitespace-pre-wrap text-sm">{extractedText}</pre>
          </div>
        </div>
      )}

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-800 mb-2">Supported File Types:</h3>
        <ul className="text-blue-700 text-sm space-y-1">
          <li>• PDF files (text extraction + OCR fallback)</li>
          <li>• Image files: JPG, JPEG, PNG, GIF, BMP, WebP</li>
          <li>• OCR works offline - no API keys required</li>
          <li>• Free to use with Tesseract.js</li>
        </ul>
      </div>
    </div>
  );
};

export default OCRTest;
