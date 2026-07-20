export const THEMES = ["dark", "light"] as const;
export type Theme = (typeof THEMES)[number];

export const DEFAULT_THEME: Theme = "dark";
export const THEME_COOKIE = "sk_theme";
export const THEME_STORAGE_KEY = "sk_theme";
/** 1 year */
export const THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function isTheme(value: string | undefined | null): value is Theme {
  return value === "dark" || value === "light";
}

export function parseTheme(value: string | undefined | null): Theme {
  return isTheme(value) ? value : DEFAULT_THEME;
}

/** Inline script — set `data-theme` before paint to avoid FOUC. */
export const THEME_BOOTSTRAP_SCRIPT = `(function(){try{var k=${JSON.stringify(THEME_STORAGE_KEY)};var c=${JSON.stringify(THEME_COOKIE)};var t=null;try{t=localStorage.getItem(k)}catch(e){}if(!t){var m=document.cookie.match(new RegExp('(?:^|; )'+c+'=([^;]*)'));t=m?decodeURIComponent(m[1]):null}if(t!=='light'&&t!=='dark')t='dark';document.documentElement.setAttribute('data-theme',t)}catch(e){document.documentElement.setAttribute('data-theme','dark')}})();`;
