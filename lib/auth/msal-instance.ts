import { PublicClientApplication } from "@azure/msal-browser"
import { msalConfig } from "./msal-config"

/**
 * Singleton MSAL PublicClientApplication for the browser.
 *
 * Created lazily so that importing this module never touches `window` during
 * SSR. Call `getMsalInstance()` inside client components / event handlers.
 * `initialize()` is required by MSAL v3+ before any other API is used.
 */

let instance: PublicClientApplication | null = null
let initPromise: Promise<PublicClientApplication> | null = null

export function getMsalInstance(): PublicClientApplication {
  if (!instance) {
    instance = new PublicClientApplication(msalConfig)
  }
  return instance
}

/** Idempotently initialize the singleton and return it ready to use. */
export async function ensureMsalInitialized(): Promise<PublicClientApplication> {
  if (!initPromise) {
    const msal = getMsalInstance()
    initPromise = msal.initialize().then(() => msal)
  }
  return initPromise
}
