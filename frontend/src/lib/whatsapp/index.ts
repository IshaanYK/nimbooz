import { IWhatsAppProvider } from "./whatsappProvider";
import { MetaCloudWhatsAppProvider } from "./metaCloudProvider";
import { MockWhatsAppProvider } from "./mockProvider";
import { PersonalWhatsAppProvider } from "./personalProvider";

export * from "./whatsappProvider";
export * from "./whatsappSecurity";
export * from "./metaCloudProvider";
export * from "./mockProvider";
export * from "./personalProvider";

let cachedProvider: IWhatsAppProvider | null = null;

export function getWhatsAppProvider(): IWhatsAppProvider {
  if (cachedProvider) return cachedProvider;

  const providerType = (process.env.WHATSAPP_PROVIDER || "personal").toLowerCase().trim();

  if (providerType === "mock" || process.env.NODE_ENV === "test") {
    cachedProvider = new MockWhatsAppProvider();
    return cachedProvider;
  }

  if (providerType === "personal" || providerType === "baileys") {
    cachedProvider = new PersonalWhatsAppProvider();
    return cachedProvider;
  }

  // Fallback to official Meta Cloud API
  cachedProvider = new MetaCloudWhatsAppProvider();
  return cachedProvider;
}

export function resetWhatsAppProviderInstance(): void {
  cachedProvider = null;
}
