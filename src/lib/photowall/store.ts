// Photo Wall Studio — IndexedDB 存储（项目 JSON + 图片/音乐二进制）
import type { PWProject } from "./types";

const DB_NAME = "lione-photowall";
const DB_VER = 1;
const S_PROJECTS = "projects";
const S_ASSETS = "assets";

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VER);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(S_PROJECTS)) db.createObjectStore(S_PROJECTS, { keyPath: "id" });
      if (!db.objectStoreNames.contains(S_ASSETS)) db.createObjectStore(S_ASSETS);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

function tx<T>(store: string, mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const t = db.transaction(store, mode);
        const req = fn(t.objectStore(store));
        req.onsuccess = () => resolve(req.result as T);
        req.onerror = () => reject(req.error);
      }),
  );
}

export async function listProjects(): Promise<PWProject[]> {
  const all = await tx<PWProject[]>(S_PROJECTS, "readonly", (s) => s.getAll());
  return (all || []).sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function getProject(id: string): Promise<PWProject | null> {
  return (await tx<PWProject | undefined>(S_PROJECTS, "readonly", (s) => s.get(id))) ?? null;
}

export async function saveProject(p: PWProject): Promise<void> {
  await tx(S_PROJECTS, "readwrite", (s) => s.put({ ...p, updatedAt: Date.now() }));
}

export async function deleteProject(id: string): Promise<void> {
  await tx(S_PROJECTS, "readwrite", (s) => s.delete(id));
}

export async function putAsset(blob: Blob): Promise<string> {
  const id = crypto.randomUUID();
  await tx(S_ASSETS, "readwrite", (s) => s.put(blob, id));
  return id;
}

export async function getAsset(id: string): Promise<Blob | null> {
  return (await tx<Blob | undefined>(S_ASSETS, "readonly", (s) => s.get(id))) ?? null;
}

export async function deleteAsset(id: string): Promise<void> {
  await tx(S_ASSETS, "readwrite", (s) => s.delete(id));
}

const urlCache = new Map<string, string>();

export async function assetUrl(id: string): Promise<string | null> {
  const cached = urlCache.get(id);
  if (cached) return cached;
  const blob = await getAsset(id);
  if (!blob) return null;
  const url = URL.createObjectURL(blob);
  urlCache.set(id, url);
  return url;
}

export function cachedAssetUrl(id: string): string | undefined {
  return urlCache.get(id);
}

export async function hashBlob(blob: Blob): Promise<string> {
  const buf = await blob.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(digest).slice(0, 12))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
