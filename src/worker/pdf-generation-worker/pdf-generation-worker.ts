/// <reference lib="webworker" />
import { WorkerMessage, WorkerResponse, WorkerProgressResponse } from "./types";
import { generatePdf } from "../../services/playlist-pdf-generator";

self.onmessage = async (event: MessageEvent<WorkerMessage>) => {
  const { action, payload } = event.data;

  if (action === "generatePdf") {
    try {
        const generatedPdf = await generatePdf(payload.playlists, async (progressUpdate) => {
            const progressResponse: WorkerProgressResponse = {
              type: "progress",
              payload: progressUpdate
            }
            self.postMessage(progressResponse);
        })
        const blob =  generatedPdf.output('blob');
        
        const completeResponse: WorkerResponse = {
            type: "complete",
            payload: {
              success: true,
              pdf: blob,
            }
        };
        self.postMessage(completeResponse);
    } catch (error) {
      const errorResponse: WorkerResponse = {
        type: "complete",
        payload: {
          success: false,
          error: (error as Error).message || "Unknown error",
        }
      };
      self.postMessage(errorResponse);
    }
  }
};

export {};