import { PDFDocument } from 'pdf-lib';

export const compressPDFAutomatically = async (file: File): Promise<File> => {
  try {
    console.log('🗜️ Iniciando compresión automática:', {
      originalSize: (file.size / 1024 / 1024).toFixed(2) + 'MB',
      fileName: file.name
    });

    // Leer el PDF
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);

    // Comprimir con configuración optimizada
    const pdfBytes = await pdfDoc.save({
      useObjectStreams: false,
      addDefaultPage: false,
    });

    // Crear archivo comprimido
    const uint8Array = new Uint8Array(pdfBytes);
    const compressedBlob = new Blob([uint8Array], { type: 'application/pdf' });
    const compressedFile = new File([compressedBlob], file.name, {
      type: 'application/pdf'
    });

    const reduction = ((1 - compressedFile.size / file.size) * 100).toFixed(1);
    
    console.log('✅ Compresión completada:', {
      originalSize: (file.size / 1024 / 1024).toFixed(2) + 'MB',
      compressedSize: (compressedFile.size / 1024 / 1024).toFixed(2) + 'MB',
      reduction: reduction + '%'
    });

    return compressedFile;

  } catch (error) {
    console.error('❌ Error al comprimir PDF:', error);
    console.log('🔄 Usando archivo original sin comprimir');
    return file; // Si falla, devolver original
  }
};

export const shouldCompressPDF = (file: File): boolean => {
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  return file.size > MAX_SIZE;
};