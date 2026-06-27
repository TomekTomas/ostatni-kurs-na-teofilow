import { describe, expect, it } from "vitest";
import { createRunSummary } from "../src/logic/runSummary.js";
import { SCORE_QUEUE_KEY, enqueueScore, markQueueAttempt, readScoreQueue, removeQueuedScore } from "../src/services/offlineQueue.js";

function memoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
}

const run = createRunSummary({ id: "queue-1", completed: true, score: 100, servedStops: 34, satisfaction: 80 });

describe("kolejka wynikow offline", () => {
  it("dodaje prawidlowy wynik", () => {
    expect(enqueueScore(run, memoryStorage(), 123)).toEqual([{ id: "score-queue-1", run, queuedAt: 123, attempts: 0 }]);
  });

  it("deduplikuje ponowna wysylke tego samego kursu", () => {
    const storage = memoryStorage();
    enqueueScore(run, storage, 1);
    enqueueScore(run, storage, 2);
    expect(readScoreQueue(storage)).toHaveLength(1);
    expect(readScoreQueue(storage)[0].queuedAt).toBe(2);
  });

  it("zlicza proby wysylki", () => {
    const storage = memoryStorage();
    enqueueScore(run, storage);
    expect(markQueueAttempt("score-queue-1", storage)[0].attempts).toBe(1);
  });

  it("usuwa wyslany wpis", () => {
    const storage = memoryStorage();
    enqueueScore(run, storage);
    expect(removeQueuedScore("score-queue-1", storage)).toEqual([]);
  });

  it("ignoruje uszkodzone dane", () => {
    const storage = memoryStorage({ [SCORE_QUEUE_KEY]: JSON.stringify([{ id: "bad", run: {} }]) });
    expect(readScoreQueue(storage)).toEqual([]);
  });
});
