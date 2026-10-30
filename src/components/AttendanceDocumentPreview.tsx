import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import type { PDFDocumentLoadingTask, PDFDocumentProxy, RenderTask } from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import type { RegisterFileKind } from '../utils/registerScan';

interface AttendanceDocumentPreviewProps {
  file: File;
  kind: RegisterFileKind;
}

export const AttendanceDocumentPreview: React.FC<AttendanceDocumentPreviewProps> = ({ file, kind }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [objectUrl, setObjectUrl] = useState('');
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setObjectUrl(url);
    setPdf(null);
    setPageNumber(1);
    setPageCount(0);
    setError('');
    setIsLoading(true);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    if (!objectUrl || kind !== 'pdf') return;
    let disposed = false;
    let loadingTask: PDFDocumentLoadingTask | null = null;
    import('pdfjs-dist').then(({ getDocument, GlobalWorkerOptions }) => {
      if (disposed) return;
      GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
      loadingTask = getDocument({ url: objectUrl });
      return loadingTask.promise.then((loadedPdf) => {
        if (!disposed) {
          setPdf(loadedPdf);
          setPageCount(loadedPdf.numPages);
          setIsLoading(false);
        }
      });
    }).catch((reason: unknown) => {
      if (!disposed) {
        setError(reason instanceof Error ? reason.message : 'Unable to render this PDF.');
        setIsLoading(false);
      }
    });
    return () => {
      disposed = true;
      if (loadingTask) void loadingTask.destroy();
    };
  }, [objectUrl, kind]);

  useEffect(() => {
    if (!pdf || !canvasRef.current) return;
    let cancelled = false;
    let renderTask: RenderTask | null = null;
    setIsLoading(true);
    pdf.getPage(pageNumber).then((page) => {
      if (cancelled || !canvasRef.current) return;
      const canvas = canvasRef.current;
      const naturalViewport = page.getViewport({ scale: 1 });
      const scale = Math.min(1.5, 800 / naturalViewport.width);
      const viewport = page.getViewport({ scale: Math.max(1, scale) });
      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Unable to prepare the PDF preview canvas.');
      renderTask = page.render({ canvas, canvasContext: context, viewport });
      return renderTask.promise;
    }).then(() => {
      if (!cancelled) setIsLoading(false);
    }).catch((reason: unknown) => {
      if (!cancelled && !(reason instanceof Error && reason.name === 'RenderingCancelledException')) {
        setError(reason instanceof Error ? reason.message : 'Unable to render this PDF page.');
        setIsLoading(false);
      }
    });
    return () => {
      cancelled = true;
      renderTask?.cancel();
    };
  }, [pdf, pageNumber]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold text-neutral-700">Uploaded File Preview</span>
        {objectUrl && <a href={objectUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-neutral-600 hover:text-black">
          <ExternalLink className="h-3.5 w-3.5" />
          Open file
        </a>}
      </div>
      <div className="relative flex min-h-40 max-h-[32rem] items-center justify-center overflow-auto rounded-lg border border-neutral-200 bg-white p-2">
        {kind === 'image' && objectUrl && (
          <img src={objectUrl} alt={`Uploaded attendance register ${file.name}`} className="max-h-[30rem] max-w-full object-contain" onLoad={() => setIsLoading(false)} onError={() => { setError('Unable to display this image file.'); setIsLoading(false); }} />
        )}
        {kind === 'pdf' && <canvas ref={canvasRef} className="h-auto max-w-full" />}
        {isLoading && !error && (
          <span className="absolute rounded bg-white/90 px-3 py-2 text-xs text-neutral-600">Loading preview…</span>
        )}
        {error && <span role="alert" className="p-4 text-center text-xs text-rose-700">{error}</span>}
      </div>
      {kind === 'pdf' && pageCount > 0 && (
        <div className="flex items-center justify-between text-xs text-neutral-600">
          <button type="button" disabled={pageNumber <= 1} onClick={() => setPageNumber((page) => page - 1)} className="inline-flex items-center gap-1 rounded-lg border border-neutral-200 px-2 py-1 disabled:opacity-40">
            <ChevronLeft className="h-3.5 w-3.5" /> Previous
          </button>
          <span>Page {pageNumber} of {pageCount}</span>
          <button type="button" disabled={pageNumber >= pageCount} onClick={() => setPageNumber((page) => page + 1)} className="inline-flex items-center gap-1 rounded-lg border border-neutral-200 px-2 py-1 disabled:opacity-40">
            Next <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
