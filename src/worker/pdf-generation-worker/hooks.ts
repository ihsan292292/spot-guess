import { useEffect, useRef, useState } from "react";
import { WorkerMessage, WorkerResponse, GeneratePdfPayload } from "./types";
import { ProgressUpdate } from "../../services/playlist-pdf-generator";

export const usePdfGenerationWorker = () => {
  const workerRef = useRef<Worker | null>(null);
  const [generationStatus, setGenerationStatus] = useState<'initialized'|'started'|'finished'|'error'>('initialized')

  useEffect(() => {
    workerRef.current = new Worker(new URL("./pdf-generation-worker.ts", import.meta.url), {
      type: "module",
    });

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const generatePdf = (props: {
    payload: GeneratePdfPayload, 
    onProgress?: (progressUpdate: ProgressUpdate) => Promise<void>
  }): Promise<Blob> => {
    const {payload, onProgress} = props;
    return new Promise((resolve, reject) => {
      if (!workerRef.current) {
        return reject(new Error("Worker is not initialized"));
      }

      workerRef.current.onmessage = (event: MessageEvent<WorkerResponse>) => {
        const data = event.data;
        if (data.type === "progress") {
          onProgress?.(data.payload)
        } else if (data.type === "complete") {
          const { payload: {success, pdf, error} } = data;
          if (success && pdf) {
            setGenerationStatus('finished');
            resolve(pdf);
          } else {
            setGenerationStatus('error');
            reject(new Error(error || "Unknown error generating PDF"));
          }
        }
      };


      const message: WorkerMessage = {
        action: "generatePdf",
        payload,
      };
      setGenerationStatus('started');
      workerRef.current.postMessage(message);
    });
  };

  return { generatePdf, generationStatus };
};