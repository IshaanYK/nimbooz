/**
 * AASRA WhatsApp Provider Abstraction
 * Decouples agricultural and business logic from specific messaging APIs.
 */

export interface WhatsAppSendOptions {
  previewUrl?: boolean;
}

export interface InteractiveButton {
  id: string;
  title: string;
}

export interface InteractiveListSection {
  title: string;
  rows: Array<{
    id: string;
    title: string;
    description?: string;
  }>;
}

export interface IWhatsAppProvider {
  name: string;

  /** Send plain text message */
  sendText(to: string, text: string, options?: WhatsAppSendOptions): Promise<{ messageId: string; success: boolean }>;

  /** Send interactive quick-reply buttons (max 3) */
  sendButtons(to: string, body: string, buttons: InteractiveButton[]): Promise<{ messageId: string; success: boolean }>;

  /** Send interactive selection list (max 10 rows) */
  sendList?(to: string, header: string, body: string, buttonText: string, sections: InteractiveListSection[]): Promise<{ messageId: string; success: boolean }>;

  /** Send image with optional caption */
  sendImage(to: string, imageUrl: string, caption?: string): Promise<{ messageId: string; success: boolean }>;

  /** Send audio / voice note */
  sendAudio(to: string, audioUrl: string): Promise<{ messageId: string; success: boolean }>;

  /** Send GPS location coordinate pin */
  sendLocation(to: string, latitude: number, longitude: number, name?: string, address?: string): Promise<{ messageId: string; success: boolean }>;

  /** Send pre-approved Meta Template message */
  sendTemplate(to: string, templateName: string, languageCode: string, components?: any[]): Promise<{ messageId: string; success: boolean }>;

  /** Download binary media from provider (voice note or uploaded crop photo) */
  downloadMedia(mediaId: string): Promise<{ buffer: Buffer; mimeType: string }>;
}
