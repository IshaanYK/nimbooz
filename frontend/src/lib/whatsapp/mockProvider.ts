import {
  IWhatsAppProvider,
  WhatsAppSendOptions,
  InteractiveButton,
  InteractiveListSection,
} from "./whatsappProvider";

export interface MockSentMessage {
  to: string;
  type: "text" | "buttons" | "list" | "image" | "audio" | "location" | "template";
  content: any;
  sentAt: string;
}

export class MockWhatsAppProvider implements IWhatsAppProvider {
  public name = "mock";
  public sentMessages: MockSentMessage[] = [];

  public async sendText(
    to: string,
    text: string,
    options?: WhatsAppSendOptions
  ): Promise<{ messageId: string; success: boolean }> {
    const messageId = `mock-msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    this.sentMessages.push({
      to,
      type: "text",
      content: { text, options },
      sentAt: new Date().toISOString(),
    });
    return { messageId, success: true };
  }

  public async sendButtons(
    to: string,
    body: string,
    buttons: InteractiveButton[]
  ): Promise<{ messageId: string; success: boolean }> {
    const messageId = `mock-btn-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    this.sentMessages.push({
      to,
      type: "buttons",
      content: { body, buttons },
      sentAt: new Date().toISOString(),
    });
    return { messageId, success: true };
  }

  public async sendList(
    to: string,
    header: string,
    body: string,
    buttonText: string,
    sections: InteractiveListSection[]
  ): Promise<{ messageId: string; success: boolean }> {
    const messageId = `mock-lst-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    this.sentMessages.push({
      to,
      type: "list",
      content: { header, body, buttonText, sections },
      sentAt: new Date().toISOString(),
    });
    return { messageId, success: true };
  }

  public async sendImage(
    to: string,
    imageUrl: string,
    caption?: string
  ): Promise<{ messageId: string; success: boolean }> {
    const messageId = `mock-img-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    this.sentMessages.push({
      to,
      type: "image",
      content: { imageUrl, caption },
      sentAt: new Date().toISOString(),
    });
    return { messageId, success: true };
  }

  public async sendAudio(
    to: string,
    audioUrl: string
  ): Promise<{ messageId: string; success: boolean }> {
    const messageId = `mock-aud-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    this.sentMessages.push({
      to,
      type: "audio",
      content: { audioUrl },
      sentAt: new Date().toISOString(),
    });
    return { messageId, success: true };
  }

  public async sendLocation(
    to: string,
    latitude: number,
    longitude: number,
    name?: string,
    address?: string
  ): Promise<{ messageId: string; success: boolean }> {
    const messageId = `mock-loc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    this.sentMessages.push({
      to,
      type: "location",
      content: { latitude, longitude, name, address },
      sentAt: new Date().toISOString(),
    });
    return { messageId, success: true };
  }

  public async sendTemplate(
    to: string,
    templateName: string,
    languageCode: string,
    components?: any[]
  ): Promise<{ messageId: string; success: boolean }> {
    const messageId = `mock-tpl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    this.sentMessages.push({
      to,
      type: "template",
      content: { templateName, languageCode, components },
      sentAt: new Date().toISOString(),
    });
    return { messageId, success: true };
  }

  public async downloadMedia(mediaId: string): Promise<{ buffer: Buffer; mimeType: string }> {
    return {
      buffer: Buffer.from("mock-binary-media"),
      mimeType: "image/jpeg",
    };
  }
}
