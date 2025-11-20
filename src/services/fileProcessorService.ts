import { ProcessedFile, TextProcessingResult, FileMetadata } from '../types';
import * as pdfjsLib from 'pdfjs-dist';

export class FileProcessorService {
  private static readonly MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
  private static readonly SUPPORTED_TYPES = ['application/pdf', 'text/plain', 'text/markdown'];

  static async processFile(file: File): Promise<ProcessedFile> {
    if (!this.isValidFile(file)) {
      throw new Error('Tipo de archivo no soportado o archivo demasiado grande');
    }

    let rawContent = '';
    let metadata: Partial<FileMetadata> = {};

    try {
      if (file.type === 'application/pdf') {
        const result = await this.processPDF(file);
        rawContent = result.text;
        metadata = { ...metadata, ...result.metadata };
      } else {
        rawContent = await this.processTextFile(file);
      }

      const cleanedContent = this.cleanText(rawContent);
      
      // Detectar idioma automáticamente
      const detectedLanguage = this.detectLanguage(cleanedContent);
      metadata.language = detectedLanguage;
      
      return {
        originalFile: file,
        cleanedContent,
        metadata: {
          ...metadata,
          wordCount: this.countWords(cleanedContent),
          characterCount: cleanedContent.length
        },
        warnings: this.getWarnings(cleanedContent)
      };
    } catch (error) {
      throw new Error(`Error procesando archivo: ${error.message}`);
    }
  }

  private static detectLanguage(text: string): string {
    // Detección simple de idioma basada en palabras comunes
    const spanishWords = ['el', 'la', 'de', 'que', 'y', 'en', 'un', 'es', 'se', 'no', 'te', 'lo', 'le', 'da', 'su', 'por', 'son', 'con', 'para', 'como', 'del', 'las', 'los', 'una', 'al'];
    const englishWords = ['the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this', 'but', 'his', 'by', 'from'];
    
    const words = text.toLowerCase().split(/\s+/);
    const spanishCount = words.filter(word => spanishWords.includes(word)).length;
    const englishCount = words.filter(word => englishWords.includes(word)).length;
    
    if (spanishCount > englishCount * 1.5) return 'es';
    if (englishCount > spanishCount * 1.5) return 'en';
    
    return 'es'; // Default a español
  }

  private static async processPDF(file: File): Promise<{ text: string; metadata: Partial<FileMetadata> }> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let fullText = '';
    let metadata: Partial<FileMetadata> = {
      pageCount: pdf.numPages,
      language: 'es'
    };

    // Procesar cada página
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      
      fullText += pageText + '\n\n';
    }

    return { text: fullText, metadata };
  }

  private static async processTextFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const text = e.target?.result as string;
        resolve(text);
      };
      
      reader.onerror = () => reject(new Error('Error leyendo archivo de texto'));
      reader.readAsText(file, 'UTF-8');
    });
  }

  private static cleanText(rawText: string): string {
    return rawText
      // Limpiar metadatos del PDF (más completo)
      .replace(/^[0-9]{1,3}\s*$/gm, '') // Números de página aislados
      .replace(/\b(?:ISBN|issn|edicion|edition|editorial|pagina|page|volumen|vol)\b.*$/gim, '')
      .replace(/©\s*[\d\s\-A-Za-z\.]+/gi, '') // Copyright
      .replace(/\b(?:http|www\.)\S+/gi, '') // URLs
      .replace(/\b(?:mailto|email)\s*:\s*\S+@\S+/gi, '') // Emails
      .replace(/\b(?:copyright|all rights reserved)\b/gi, '') // Copyright adicional
      .replace(/\b(?:figura|tabla|figure|table)\s*\d+/gi, '') // Referencias a figuras/tablas
      
      // Referencias bibliográficas más extensas
      .replace(/\(\s*\d{4}\s*\)/g, '') // Años entre paréntesis
      .replace(/DOI\s*:?\s*[\w\.\-]+\/[\w\.\-]+/gi, '')
      .replace(/\b(?:pp?\.|p\.)\s*\d+(?:[–\-]\d+)?\b/gi, '') // Números de página
      .replace(/\b(?:referencia|bibliografia|bibliography|cita|citation)\b.*$/gim, '')
      .replace(/^[A-Z][a-z]+,\s*[A-Z]\.\s*\(\d{4}\)\.?\s*/gim, '') // Referencias tipo "Smith, J. (2020)."
      
      // Headers y footers comunes más variados
      .replace(/^(?:autonomous|autonomous|nervioso|autonomo|sistema|chapter|capítulo)\s*\n+/gim, '')
      .replace(/\n+(?:===|---|___|****|====)\n+/g, '\n') // Separadores múltiples
      .replace(/^(?:continued|continua|continúa)\s*$/gim, '') // "Continúa" en footers
      
      // OCR artifacts mejorado
      .replace(/[^\x20-\x7EáéíóúñÑ¡¿üÜäÄöÖß]/g, ' ') // Mantener caracteres extendidos
      .replace(/\s+/g, ' ') // Normalizar espacios múltiples
      
      // Limpiar líneas muy cortas que podrían ser ruido
      .replace(/^\s*[A-Z]{1,3}\s*$/gm, '') // Abreviaciones aisladas
      .replace(/^\s*[0-9\.\-]+\s*$/gm, '') // Números aislados
      
      // Mantener solo párrafos con contenido sustancial (menos restrictivo)
      .split('\n')
      .filter(line => {
        const trimmed = line.trim();
        return trimmed.length > 5 && // Reducido de 10 a 5
               !/^(?:figura|tabla|capítulo|chapter|página|page)\s*\d+$/i.test(trimmed) &&
               !/^[0-9\.\-]+$/.test(trimmed) &&
               trimmed.split(' ').length > 2;
      })
      .join('\n\n')
      
      // Limpiar espacios en blanco
      .trim();
  }

  private static getWarnings(text: string): string[] {
    const warnings: string[] = [];
    
    if (text.length < 1000) {
      warnings.push('El contenido procesado es muy corto, podría haber problemas con la extracción');
    }
    
    if (text.split('\n').length < 10) {
      warnings.push('Pocos párrafos detectados, revisar la calidad del archivo original');
    }
    
    const ratio = text.replace(/\s/g, '').length / text.length;
    if (ratio < 0.3) {
      warnings.push('Alto porcentaje de espacios en blanco, posible contenido de baja calidad');
    }
    
    return warnings;
  }

  private static countWords(text: string): number {
    return text
      .trim()
      .split(/\s+/)
      .filter(word => word.length > 0)
      .length;
  }

  private static isValidFile(file: File): boolean {
    return (
      this.SUPPORTED_TYPES.includes(file.type) &&
      file.size <= this.MAX_FILE_SIZE
    );
  }

  static getFileMetadata(file: File): Promise<FileMetadata> {
    return new Promise(async (resolve) => {
      const metadata: FileMetadata = {
        wordCount: 0,
        characterCount: 0,
        language: 'es'
      };

      if (file.type === 'application/pdf') {
        try {
          const arrayBuffer = await file.arrayBuffer();
          const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
          metadata.pageCount = pdf.numPages;
        } catch (error) {
          console.warn('Error obteniendo metadatos del PDF:', error);
        }
      }

      // Estimar duración de lectura (promedio 200 palabras por minuto)
      if (file.type === 'text/plain') {
        try {
          const content = await this.processTextFile(file);
          metadata.wordCount = this.countWords(content);
          metadata.characterCount = content.length;
        } catch (error) {
          console.warn('Error obteniendo metadatos del texto:', error);
        }
      }

      resolve(metadata);
    });
  }
}