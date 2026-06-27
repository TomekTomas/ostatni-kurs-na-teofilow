import { isValidRunSummary } from "../logic/runSummary.js";
import { browserStorage, readJson, writeJson } from "./storage.js";

export const SCORE_QUEUE_KEY = "kurs8.scoreQueue.v1";
const MAX_QUEUE_SIZE = 40;

export function readScoreQueue(storage = browserStorage()) {
  const queue = readJson(storage, SCORE_QUEUE_KEY, []);
  return Array.isArray(queue) ? queue.filter((item) => item?.id && isValidRunSummary(item.run)).slice(-MAX_QUEUE_SIZE) : [];
}

export function enqueueScore(run, storage = browserStorage(), now = Date.now()) {
  const queue = readScoreQueue(storage).filter((item) => item.run.id !== run.id);
  queue.push({ id: `score-${run.id}`, run, queuedAt: now, attempts: 0 });
  writeJson(storage, SCORE_QUEUE_KEY, queue.slice(-MAX_QUEUE_SIZE));
  return queue.slice(-MAX_QUEUE_SIZE);
}

export function removeQueuedScore(id, storage = browserStorage()) {
  const queue = readScoreQueue(storage).filter((item) => item.id !== id);
  writeJson(storage, SCORE_QUEUE_KEY, queue);
  return queue;
}

export function markQueueAttempt(id, storage = browserStorage()) {
  const queue = readScoreQueue(storage).map((item) => item.id === id ? { ...item, attempts: item.attempts + 1 } : item);
  writeJson(storage, SCORE_QUEUE_KEY, queue);
  return queue;
}
