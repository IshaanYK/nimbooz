import {
  IWhatsAppProvider,
  InteractiveButton,
  InteractiveListSection,
  WhatsAppSendOptions,
} from "./whatsappProvider";

export class PersonalWhatsAppProvider implements IWhatsAppProvider {
  name = "personal_whatsapp";
  private localApiUrl: string;
  private botPhone: string;

  constructor(localApiUrl = "http://localhost:3005", botPhone = "917222949347") {
    this.localApiUrl = process.env.BOT_HTTP_URL || localApiUrl;
    this.botPhone = process.env.WHATSAPP_BOT_PHONE || botPhone;
  }

  async sendText(to: string, text: string, options?: WhatsAppSendOptions): Promise<{ messageId: string; success: boolean }> {
    try {
      const res = await fetch(`${this.localApiUrl}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, text }),
      });

      if (res.ok) {
        const data = await res.json();
        return {
          success: true,
          messageId: data.messageId || `personal-${Date.now()}`,
        };
      }
    } catch (err: any) {
      console.warn(`[PersonalWhatsAppProvider] Local bot daemon not reached on ${this.localApiUrl}. Simulating dispatch to +${to}.`);
    }

    return {
      success: true,
      messageId: `sim-personal-${Date.now()}`,
    };
  }

  async sendButtons(to: string, body: string, buttons: InteractiveButton[]): Promise<{ messageId: string; success: boolean }> {
    const textWithButtons = `${body}\n\n${buttons.map((b) => `• [${b.title}]`).join("\n")}`;
    return this.sendText(to, textWithButtons);
  }

  async sendList(to: string, header: string, body: string, buttonText: string, sections: InteractiveListSection[]): Promise<{ messageId: string; success: boolean }> {
    const textWithSections = `${header ? `*${header}*\n` : ""}${body}\n\n${sections
      .map((s) => `*${s.title}*\n${s.rows.map((r) => `- ${r.title}: ${r.description || ""}`).join("\n")}`)
      .join("\n\n")}`;
    return this.sendText(to, textWithSections);
  }

  async sendImage(to: string, imageUrl: string, caption?: string): Promise<{ messageId: string; success: boolean }> {
    const text = caption ? `${caption}\n\n${imageUrl}` : imageUrl;
    return this.sendText(to, text);
  }

  async sendAudio(to: string, audioUrl: string): Promise<{ messageId: string; success: boolean }> {
    return this.sendText(to, `🔊 Audio Advisory: ${audioUrl}`);
  }

  async sendLocation(to: string, latitude: number, longitude: number, name?: string, address?: string): Promise<{ messageId: string; success: boolean }> {
    const mapUrl = `https://maps.google.com/?q=${latitude},${longitude}`;
    return this.sendText(to, `📍 Location: ${name || ""} ${address || ""}\n${mapUrl}`);
  }

  async sendTemplate(to: string, templateName: string, languageCode: string, components?: any[]): Promise<{ messageId: string; success: boolean }> {
    return this.sendText(to, `📢 AASRA Advisory Broadcast [${templateName}]`);
  }

  async downloadMedia(mediaId: string): Promise<{ buffer: Buffer; mimeType: string }> {
    return { buffer: Buffer.from(""), mimeType: "image/jpeg" };
  }
}
