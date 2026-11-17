import createBrowserClient from "@/shared/lib/supabase/client";

export const COUPON_IMAGE_BUCKET = "coupon-image";
// 서명 URL이 바뀌면 같은 이미지도 다시 받아야 해서 길게 유지
export const SIGNED_URL_EXPIRES_IN = 60 * 60; // 1 hour (seconds)
/** 만료까지 이보다 적게 남으면 새로 발급 (사진을 받는 도중 만료되지 않게) */
const REFRESH_MARGIN_MS = 5 * 60 * 1000;
const STORAGE_KEY = "coupon-image-signed-urls";

interface SignedUrlEntry {
  url: string;
  /** 만료 시각 (ms) */
  expiresAt: number;
}

const isUsable = (entry?: SignedUrlEntry): entry is SignedUrlEntry =>
  !!entry && entry.expiresAt - Date.now() > REFRESH_MARGIN_MS;

/**
 * 사진 경로별 서명 URL
 * 서명 URL은 발급할 때마다 주소가 달라져, 새로 발급하면 브라우저·Vercel 이미지 캐시를 못 씀
 * → 앱을 다시 열어도 유효한 URL을 그대로 쓰도록 localStorage에도 저장
 */
let entries: Map<string, SignedUrlEntry> | null = null;

const getEntries = () => {
  if (entries) return entries;
  entries = new Map();
  try {
    const saved: Record<string, SignedUrlEntry> = JSON.parse(
      localStorage.getItem(STORAGE_KEY) ?? "{}",
    );
    for (const [path, entry] of Object.entries(saved)) {
      if (isUsable(entry)) entries.set(path, entry);
    }
  } catch {
    // 저장소를 쓸 수 없으면 메모리에만 둠
  }
  return entries;
};

const saveEntries = () => {
  try {
    const usable = [...getEntries()].filter(([, entry]) => isUsable(entry));
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(Object.fromEntries(usable)),
    );
  } catch {
    // 저장하지 못해도 이번 실행 동안은 메모리 값을 씀
  }
};

/** 발급 중인 경로 (같은 경로를 두 번 요청하지 않게) */
const pending = new Map<string, Promise<string>>();
/** 이번 차례에 한 번에 발급할 경로 */
let queued = new Map<
  string,
  { resolve: (url: string) => void; reject: (error: Error) => void }
>();

const flushQueue = async () => {
  const batch = queued;
  queued = new Map();
  // 응답을 받는 사이 지난 시간만큼 만료를 이르게 잡아, 실제보다 늦게 만료된다고 여기지 않게 함
  const expiresAt = Date.now() + SIGNED_URL_EXPIRES_IN * 1000;

  const urls = new Map<string, string>();
  try {
    const supabase = createBrowserClient();
    const { data, error } = await supabase.storage
      .from(COUPON_IMAGE_BUCKET)
      .createSignedUrls([...batch.keys()], SIGNED_URL_EXPIRES_IN);
    if (error) throw error;
    for (const { path, signedUrl, error: itemError } of data) {
      if (path && signedUrl && !itemError) urls.set(path, signedUrl);
    }
  } catch (error) {
    console.error("쿠폰 이미지 URL 조회 중 에러 발생:", error);
  }

  for (const [path, { resolve, reject }] of batch) {
    pending.delete(path);
    const url = urls.get(path);
    if (url) {
      getEntries().set(path, { url, expiresAt });
      resolve(url);
    } else {
      reject(new Error("쿠폰 이미지 URL 조회 중 오류가 발생했어요"));
    }
  }
  saveEntries();
};

const requestSignedUrl = (path: string) => {
  const existing = pending.get(path);
  if (existing) return existing;

  const promise = new Promise<string>((resolve, reject) => {
    // 같은 순간에 요청된 경로(목록의 사진들)를 모아 요청 한 번으로 발급
    if (queued.size === 0) setTimeout(flushQueue, 0);
    queued.set(path, { resolve, reject });
  });
  // 미리 받기만 하고 아무도 기다리지 않을 때 처리되지 않은 에러로 남지 않게 함 (기다리는 쪽은 그대로 에러를 받음)
  promise.catch(() => {});
  pending.set(path, promise);
  return promise;
};

/** 목록을 받자마자 사진 URL 발급을 시작해, 사진이 화면에 그려질 때 이미 받아 두도록 함 */
export const prefetchImageSignedUrls = (paths: string[]) => {
  for (const path of paths) {
    if (path && !isUsable(getEntries().get(path))) requestSignedUrl(path);
  }
};

export const getImageSignedUrl = async (path: string) => {
  const entry = getEntries().get(path);
  if (isUsable(entry)) return entry.url;
  return requestSignedUrl(path);
};

/** 로그아웃하면 저장해 둔 사진 URL을 지움 (다른 사람이 이 기기에서 로그인할 수 있으므로) */
export const clearImageSignedUrls = () => {
  entries = new Map();
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // 저장소를 쓸 수 없으면 지울 것도 없음
  }
};
