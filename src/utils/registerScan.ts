import type { Student, AttendanceStatus, RegisterScanEntry } from '../data/schoolContext';
import type { PDFDocumentLoadingTask } from 'pdfjs-dist';
import type { Worker as TesseractWorker } from 'tesseract.js';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import tesseractWorkerUrl from 'tesseract.js/dist/worker.min.js?url';

const MAX_FILE_SIZE = 25 * 1024 * 1024;
const MAX_PDF_PAGES = 50;

export type RegisterFileKind = 'pdf' | 'image';

export const validateRegisterFile = async (file: File): Promise<RegisterFileKind> => {
  if (file.size === 0) throw new Error('The selected file is empty.');
  if (file.size > MAX_FILE_SIZE) throw new Error('The selected file exceeds the 25 MB limit.');

  const header = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const signature = (bytes: number[]) => bytes.every((byte, index) => header[index] === byte);
  const isPdf = signature([0x25, 0x50, 0x44, 0x46, 0x2d]);
  const isPng = signature([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const isJpeg = signature([0xff, 0xd8, 0xff]);
  const isWebp = signature([0x52, 0x49, 0x46, 0x46]) &&
    header[8] === 0x57 && header[9] === 0x45 && header[10] === 0x42 && header[11] === 0x50;
  const isBmp = signature([0x42, 0x4d]);

  if (isPdf) return 'pdf';
  if (isPng || isJpeg || isWebp || isBmp) {
    try {
      const bitmap = await createImageBitmap(file);
      bitmap.close();
      return 'image';
    } catch {
      throw new Error('The image file is corrupted or cannot be decoded.');
    }
  }
  throw new Error('Unsupported file. Upload a valid PDF, PNG, JPG, WebP, or BMP file.');
};

const normalize = (value: string) =>
  value.normalize('NFKD').replace(/\p{Diacritic}/gu, '').toLowerCase().replace(/[^a-z0-9]/g, '');

const MARKS: Record<string, AttendanceStatus> = {
  p: 'Present',
  present: 'Present',
  a: 'Absent',
  absent: 'Absent',
  l: 'Late',
  late: 'Late',
  e: 'Excused',
  excused: 'Excused',
};

const isHeaderLine = (text: string) =>
  /\b(student\s*name|roll\s*(no|number)|attendance|register\s*date|class\s*section)\b/i.test(text);

interface OcrLine {
  text: string;
  confidence: number | null;
  pageNumber: number;
  words: { text: string; confidence: number | null; x?: number; y?: number }[];
}

export interface RegisterScanResult {
  entries: RegisterScanEntry[];
  detectedDate: string | null;
  detectedClass: string | null;
  detectedSection: string | null;
  extractedText: string;
  pageErrors: string[];
  pagesProcessed: number;
}

const detectedDocumentContext = (lines: OcrLine[]) => {
  const headerText = lines.slice(0, 40).map((line) => line.text).join(' ');
  const numericDate = headerText.match(/\b(\d{1,2})[./-](\d{1,2})[./-](20\d{2})\b/);
  const namedDate = headerText.match(/\b(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(20\d{2})\b/i)
    || headerText.match(/\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),?\s+(20\d{2})\b/i);
  let detectedDate: string | null = null;

  if (numericDate) {
    const [, dayText, monthText, yearText] = numericDate;
    const date = new Date(Number(yearText), Number(monthText) - 1, Number(dayText));
    if (date.getFullYear() === Number(yearText) && date.getMonth() === Number(monthText) - 1 && date.getDate() === Number(dayText)) {
      detectedDate = `${yearText}-${monthText.padStart(2, '0')}-${dayText.padStart(2, '0')}`;
    }
  } else if (namedDate) {
    const isMonthFirst = /^[a-z]/i.test(namedDate[1]);
    const day = Number(isMonthFirst ? namedDate[2] : namedDate[1]);
    const month = new Date(`${isMonthFirst ? namedDate[1] : namedDate[2]} 1, 2000`).getMonth() + 1;
    const year = namedDate[3];
    const date = new Date(Number(year), month - 1, day);
    if (month && date.getFullYear() === Number(year) && date.getMonth() === month - 1 && date.getDate() === day) {
      detectedDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
  }

  const classMatch = headerText.match(/\bclass\s*(?:grade\s*)?(\d{1,2})\b/i);
  const sectionMatch = headerText.match(/\bsection\s*([A-Z])\b/i);
  return {
    detectedDate,
    detectedClass: classMatch ? `Class ${Number(classMatch[1])}` : null,
    detectedSection: sectionMatch ? sectionMatch[1].toUpperCase() : null,
  };
};

const entriesFromLines = (lines: OcrLine[], students: Student[]): RegisterScanEntry[] => {
  const parsed = lines.flatMap((line, index) => {
    const words = [...line.words]
      .filter((word) => word.text.trim())
      .sort((left, right) => left.x === undefined || right.x === undefined ? 0 : left.x - right.x);
    const text = words.map((word) => word.text).join(' ').trim();
    if (!text || isHeaderLine(text)) return [];

    const initialTokens = words.map((word) => word.text);
    const hasRollNumber = /^(#?\d{1,3}[.)]?)$/.test(initialTokens[0] || '');
    const rollNumber = hasRollNumber ? initialTokens[0].replace(/[^\d]/g, '') : null;
    const admissionIndex = words.findIndex((word) => /^[a-z]{2,}[- ]?\d{4}[- ]?\d{2,}$/i.test(word.text));
    const firstNameIndex = hasRollNumber ? 1 : 0;
    const minimumMarkIndex = Math.max(firstNameIndex + 2, admissionIndex + 1);
    const markCandidates = words
      .map((word, wordIndex) => ({ word, wordIndex, status: MARKS[normalize(word.text)] }))
      .filter(({ word, wordIndex, status }) =>
        wordIndex >= minimumMarkIndex && (status || /^[?x✓✔✗-]$/i.test(word.text))
      );
    const markCandidate = markCandidates[0];
    const markIndex = markCandidate?.wordIndex ?? -1;
    const markWord = markIndex >= 0 ? words[markIndex].text : '';
    const rawTokens = words.slice(0, markIndex >= 0 ? markIndex : words.length);
    const rollIndex = rawTokens.length && /^(#?\d{1,3}[.)]?)$/.test(rawTokens[0].text) ? 0 : -1;
    const rowAdmissionIndex = rawTokens.findIndex((word) => /^[a-z]{2,}[- ]?\d{4}[- ]?\d{2,}$/i.test(word.text));
    const admissionNumber = rowAdmissionIndex >= 0 ? rawTokens[rowAdmissionIndex].text : null;
    const name = rawTokens
      .filter((_, tokenIndex) => tokenIndex !== rollIndex && tokenIndex !== rowAdmissionIndex)
      .map((word) => word.text)
      .join(' ')
      .trim();
    if (!name || !/[a-z]/i.test(name) || name.split(/\s+/).length < 2) return [];
    if (/^(date|class|section|name|student|roll|present|absent|late|excused)$/i.test(name)) return [];

    const status = markWord ? markCandidate?.status ?? null : null;
    const markConfidence = markIndex >= 0 ? words[markIndex].confidence : null;
    const confidenceValues = [...rawTokens.map((word) => word.confidence).filter((value): value is number => value !== null)];
    if (markIndex >= 0 && words[markIndex].confidence !== null) confidenceValues.push(words[markIndex].confidence);
    const confidence = confidenceValues.length
      ? Math.round(confidenceValues.reduce((sum, value) => sum + value, 0) / confidenceValues.length)
      : line.confidence === null ? null : Math.round(line.confidence);

    return [{
      id: `SCAN-${index + 1}`,
      pageNumber: line.pageNumber,
      rollNumber,
      admissionNumber,
      scannedName: name,
      rawAttendanceMark: markWord,
      extractedStatus: status,
      confidence,
      markConfidence,
    }];
  });

  const matched = parsed.map((entry) => {
    const normalizedName = normalize(entry.scannedName);
    const nameMatches = students.filter((student) => normalize(student.name) === normalizedName);
    const admissionMatches = entry.admissionNumber
      ? students.filter((student) => normalize(student.admissionNo) === normalize(entry.admissionNumber!))
      : [];
    const candidates = entry.admissionNumber ? admissionMatches : nameMatches;
    const uniqueMatch = candidates.length === 1 ? candidates[0] : null;
    const flagReasons: string[] = [];

    if (candidates.length > 1) flagReasons.push('Multiple roster records match this entry.');
    else if (!uniqueMatch) flagReasons.push('Student could not be matched to the selected class and section.');
    if (entry.confidence === null) flagReasons.push('OCR text confidence is unavailable; verify the extracted name.');
    else if (entry.confidence < 75) flagReasons.push('OCR text confidence is low; verify the extracted name.');
    if (entry.markConfidence !== null && entry.markConfidence < 75) flagReasons.push('OCR attendance mark confidence is low; verify the mark.');
    if (!entry.extractedStatus) flagReasons.push('Attendance mark is unreadable or invalid.');

    return {
      ...entry,
      matchedStudentId: uniqueMatch?.id ?? null,
      matchedStudentName: uniqueMatch?.name ?? null,
      matchMethod: uniqueMatch ? (entry.admissionNumber ? 'Admission number' as const : 'Exact name' as const) : null,
      isFlagged: flagReasons.length > 0,
      flagReasons,
    };
  });

  const idCounts = new Map<string, number>();
  matched.forEach((entry) => {
    if (entry.matchedStudentId) idCounts.set(entry.matchedStudentId, (idCounts.get(entry.matchedStudentId) || 0) + 1);
  });
  return matched.map((entry) => {
    if (!entry.matchedStudentId || (idCounts.get(entry.matchedStudentId) || 0) < 2) return entry;
    const flagReasons = [...entry.flagReasons, 'This student appears on multiple extracted rows.'];
    return { ...entry, isFlagged: true, flagReasons };
  });
};

export const processRegisterFile = async (
  file: File,
  kind: RegisterFileKind,
  students: Student[],
  onProgress: (message: string) => void,
  signal?: AbortSignal,
): Promise<RegisterScanResult> => {
  let worker: TesseractWorker | null = null;
  let pdfTask: PDFDocumentLoadingTask | null = null;
  let cancelWorker: (() => void) | null = null;
  try {
    if (signal?.aborted) throw new DOMException('Register processing was cancelled.', 'AbortError');
    onProgress('Initializing OCR engine and loading English language data…');
    try {
      const { createWorker, PSM } = await import('tesseract.js');
      worker = await createWorker('eng', 1, {
        workerPath: tesseractWorkerUrl,
        corePath: 'https://cdn.jsdelivr.net/npm/tesseract.js-core@7.0.0',
        langPath: 'https://cdn.jsdelivr.net/npm/@tesseract.js-data/eng/4.0.0_best_int',
        logger: (message) => {
          if (message.status === 'loading tesseract core') onProgress('Loading OCR engine…');
          else if (message.status === 'initializing tesseract') onProgress('Initializing OCR engine…');
          else if (message.status === 'loading language traineddata') onProgress('Loading English OCR model…');
          else if (message.status === 'recognizing text') onProgress('Recognizing document text…');
        },
      });
      await worker.setParameters({
        tessedit_pageseg_mode: PSM.SINGLE_BLOCK,
        preserve_interword_spaces: '1',
      });
    } catch (error) {
      throw new Error(`Unable to initialize the OCR engine, load English language data, or configure recognition: ${error instanceof Error ? error.message : String(error)}`);
    }
    const activeWorker = worker;
    if (signal?.aborted) throw new DOMException('Register processing was cancelled.', 'AbortError');
    cancelWorker = () => { void activeWorker.terminate(); };
    signal?.addEventListener('abort', cancelWorker, { once: true });
    const recognizedLines: OcrLine[] = [];
    const pageTexts: string[] = [];
    const pageErrors: string[] = [];
    let pagesProcessed = 0;
    const collectResult = (data: Awaited<ReturnType<TesseractWorker['recognize']>>['data'], pageNumber: number) => {
      const blocks = data.blocks || [];
      const lines = blocks.flatMap((block) => block.paragraphs.flatMap((paragraph) => paragraph.lines));
      const pageText = data.text.trim() || lines.map((line) => line.text).join('\n').trim();
      if (pageText) pageTexts.push(`Page ${pageNumber}:\n${pageText}`);

      if (lines.length) {
        recognizedLines.push(...lines.map((line) => ({
          text: line.text,
          confidence: Number.isFinite(line.confidence) ? line.confidence : null,
          pageNumber,
          words: line.words.map((word) => ({
            text: word.text,
            confidence: Number.isFinite(word.confidence) ? word.confidence : null,
            x: word.bbox?.x0,
            y: word.bbox?.y0,
          })),
        })));
      } else if (pageText) {
        recognizedLines.push(...pageText.split(/\r?\n/).map((text) => text.trim()).filter(Boolean).map((text) => ({
          text,
          confidence: null,
          pageNumber,
          words: text.split(/\s+/).map((word) => ({ text: word, confidence: null })),
        })));
      }
      return Boolean(pageText);
    };

    if (kind === 'image') {
      onProgress('Recognizing image…');
      try {
        const result = await activeWorker.recognize(file, {}, { text: true, blocks: true });
        if (!collectResult(result.data, 1)) pageErrors.push('Image OCR completed but returned no readable text.');
        pagesProcessed = 1;
      } catch (error) {
        if (signal?.aborted) throw new DOMException('Register processing was cancelled.', 'AbortError');
        pageErrors.push(`Image recognition failed: ${error instanceof Error ? error.message : String(error)}`);
      }
    } else {
      const pdfjs = await import('pdfjs-dist');
      pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
      try {
        pdfTask = pdfjs.getDocument({ data: await file.arrayBuffer() });
      } catch (error) {
        throw new Error(`PDF.js could not open the uploaded file: ${error instanceof Error ? error.message : String(error)}`);
      }
      let pdf;
      try {
        pdf = await pdfTask.promise;
      } catch (error) {
        throw new Error(`PDF.js could not read the uploaded PDF: ${error instanceof Error ? error.message : String(error)}`);
      }
      if (pdf.numPages < 1) throw new Error('The PDF contains no pages.');
      if (pdf.numPages > MAX_PDF_PAGES) throw new Error(`The PDF has more than ${MAX_PDF_PAGES} pages.`);

      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
        if (signal?.aborted) throw new DOMException('Register processing was cancelled.', 'AbortError');
        onProgress(`Recognizing PDF page ${pageNumber} of ${pdf.numPages}…`);
        let page;
        let canvas: HTMLCanvasElement | null = null;
        try {
          page = await pdf.getPage(pageNumber);
          const naturalViewport = page.getViewport({ scale: 1 });
          const scale = Math.min(3, 3000 / Math.max(naturalViewport.width, naturalViewport.height));
          const viewport = page.getViewport({ scale });
          canvas = document.createElement('canvas');
          canvas.width = Math.ceil(viewport.width);
          canvas.height = Math.ceil(viewport.height);
          const context = canvas.getContext('2d');
          if (!context) throw new Error('Unable to prepare a canvas for PDF OCR.');
          const renderTask = page.render({ canvas, canvasContext: context, viewport });
          const cancelRender = () => renderTask.cancel();
          signal?.addEventListener('abort', cancelRender, { once: true });
          try {
            await renderTask.promise;
          } finally {
            signal?.removeEventListener('abort', cancelRender);
          }
          if (signal?.aborted) throw new DOMException('Register processing was cancelled.', 'AbortError');
          const result = await activeWorker.recognize(canvas, {}, { text: true, blocks: true });
          if (!collectResult(result.data, pageNumber)) {
            pageErrors.push(`Page ${pageNumber} OCR completed but returned no readable text.`);
          }
          pagesProcessed++;
        } catch (error) {
          if (signal?.aborted || (error instanceof Error && error.name === 'AbortError')) throw error;
          pageErrors.push(`Page ${pageNumber} failed: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
          if (canvas) {
            canvas.width = 0;
            canvas.height = 0;
          }
          if (page) page.cleanup();
        }
      }
    }

    if (signal?.aborted) throw new DOMException('Register processing was cancelled.', 'AbortError');
    const extractedText = pageTexts.join('\n\n');
    if (!extractedText.trim() && pageErrors.length) {
      throw new Error(`OCR did not complete successfully. ${pageErrors.join(' ')}`);
    }
    const entries = entriesFromLines(recognizedLines, students);
    return {
      entries,
      ...detectedDocumentContext(recognizedLines),
      extractedText,
      pageErrors,
      pagesProcessed,
    };
  } catch (error) {
    if (signal?.aborted || (error instanceof Error && error.name === 'AbortError')) {
      throw new DOMException('Register processing was cancelled.', 'AbortError');
    }
    throw error;
  } finally {
    if (cancelWorker) signal?.removeEventListener('abort', cancelWorker);
    try {
      if (pdfTask) await pdfTask.destroy();
    } finally {
      await worker?.terminate();
    }
  }
};
