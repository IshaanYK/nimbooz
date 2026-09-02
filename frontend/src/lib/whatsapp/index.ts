import { IWhatsAppProvider } from "./whatsappProvider";
import { MetaCloudWhatsAppProvider } from "./metaCloudProvider";
import { MockWhatsAppProvider } from "./mockProvider";

export * from "./whatsappProvider";
export * from "./whatsappSecurity";
export * from "./metaCloudProvider";
export * from "./mockProvider";

let cachedProvider: IWhatsAppProvider | null = null;

export function getWhatsAppProvider(): IWhatsAppProvider {
  if (cachedProvider) return cachedProvider;

  const providerType = (process.env.WHATSAPP_PROVIDER || "meta_cloud").toLowerCase().trim();

  if (providerType === "mock" || process.env.NODE_ENV === "test") {
    cachedProvider = new MockWhatsAppProvider();
    return cachedProvider;
  }

  // Default to official Meta Cloud API
  cachedProvider = new MetaCloudWhatsAppProvider();
  return cachedProvider;
}

export function resetWhatsAppProviderInstance(): void {
  cachedProvider = null;
}
