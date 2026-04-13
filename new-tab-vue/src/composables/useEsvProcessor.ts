type CacheEntry<T> = {
  value: T;
  expiry: number;
};

export async function replaceRefWithESV(ref: string): Promise<string> {
  const apiKey = 'YOUR_ESV_API_KEY';
  const cacheKey = `esv_${ref}`;

  let passage = cacheGet<string>(cacheKey);

  if (!passage) {
    try {
      const res = await fetch(
        `https://api.esv.org/v3/passage/text/?q=${encodeURIComponent(ref)}`,
        {
          headers: { Authorization: `Token ${apiKey}` },
        }
      );

      const data = await res.json();

      passage =
        data?.passages?.[0]?.replace(/\n/g, ' ') || ref;

      cacheSet(cacheKey, passage, 24 * 60 * 60 * 1000);
    } catch {
      return ref;
    }
  }

  // FIX: refText was undefined — assuming you meant the reference itself
  return `<strong>${ref}:</strong> ${passage}`;
}

function cacheGet<T>(key: string): T | null {
  if (typeof localStorage === "undefined") return null;

  const cached = localStorage.getItem(key);
  if (!cached) return null;

  try {
    const { value, expiry } = JSON.parse(cached) as CacheEntry<T>;

    if (Date.now() > expiry) {
      localStorage.removeItem(key);
      return null;
    }

    return value;
  } catch {
    localStorage.removeItem(key);
    return null;
  }
}

function cacheSet<T>(key: string, value: T, ttlMs: number): void {
  if (typeof localStorage === "undefined") return;

  const entry: CacheEntry<T> = {
    value,
    expiry: Date.now() + ttlMs,
  };

  localStorage.setItem(key, JSON.stringify(entry));
}