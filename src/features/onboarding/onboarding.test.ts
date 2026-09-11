import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  ONBOARDING_COOKIE,
  ONBOARDING_SESSION_KEY,
  selesaikanOnboarding,
  sudahOnboarding,
} from "./components/onboarding-card";

describe("onboarding session guard", () => {
  let mockStorage: Record<string, string> = {};
  let mockCookie = "";

  beforeEach(() => {
    mockStorage = {};
    mockCookie = "";

    const storage = {
      getItem: (k: string) => mockStorage[k] ?? null,
      setItem: (k: string, v: string) => {
        mockStorage[k] = v;
      },
      clear: () => {
        mockStorage = {};
      },
    };

    const doc = {
      get cookie() {
        return mockCookie;
      },
      set cookie(val: string) {
        mockCookie = val;
      },
    };

    // @ts-expect-error mock window for test
    globalThis.window = { sessionStorage: storage, document: doc };
    // @ts-expect-error mock document for test
    globalThis.document = doc;
    // @ts-expect-error mock sessionStorage for test
    globalThis.sessionStorage = storage;
  });

  afterEach(() => {
    // @ts-expect-error cleanup
    delete globalThis.window;
    // @ts-expect-error cleanup
    delete globalThis.document;
    // @ts-expect-error cleanup
    delete globalThis.sessionStorage;
  });

  it("mengembalikan false saat sesi baru belum pernah onboarding", () => {
    expect(sudahOnboarding()).toBe(false);
  });

  it("mencatat status onboarding ke sessionStorage dan session cookie saat selesaikanOnboarding dipanggil", () => {
    selesaikanOnboarding();

    expect(mockStorage[ONBOARDING_SESSION_KEY]).toBe("1");
    expect(mockCookie).toContain(`${ONBOARDING_COOKIE}=1`);
    expect(sudahOnboarding()).toBe(true);
  });

  it("mengembalikan true jika nilai ada di sessionStorage", () => {
    mockStorage[ONBOARDING_SESSION_KEY] = "1";
    expect(sudahOnboarding()).toBe(true);
  });

  it("mengembalikan true jika nilai ada di cookie", () => {
    mockCookie = `${ONBOARDING_COOKIE}=1; path=/`;
    expect(sudahOnboarding()).toBe(true);
  });
});
