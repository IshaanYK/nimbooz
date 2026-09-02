import {
  IWhatsAppProvider,
  WhatsAppSendOptions,
  InteractiveButton,
  InteractiveListSection,
} from "./whatsappProvider";
import { normalizePhoneNumber } from "./whatsappSecurity";

const GRAPH_API_BASE = "https://graph.facebook.com/v21.0";

export class MetaCloudWhatsAppProvider implements IWhatsAppProvider {
  public name = "meta_cloud";

  private token: string;
  private phoneNumberId: string;

  constructor() {
    this.token = process.env.WHATSAPP_TOKEN || "";
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || "";
  }

  private cleanRecipient(to: string): string {
    const normalized = normalizePhoneNumber(to);
    // Meta Graph API expects phone number digits without the leading '+'
    return normalized.replace(/^\+/, "");
  }

  private async postWithRetry(endpoint: string, payload: any, maxRetries = 2): Promise<any> {
    if (!this.token || !this.phoneNumberId) {
      console.warn(
        "[MetaCloudWhatsAppProvider] WHATSAPP_TOKEN or WHATSAPP_PHONE_NUMBER_ID missing. Simulating delivery in test mode."
      );
      return {
        messaging_product: "whatsapp",
        contacts: [{ input: payload.to, wa_id: payload.to }],
        messages: [{ id: `wamid.sim_${Date.now()}_${Math.random().toString(36).slice(2, 6)}` }],
      };
    }

    const url = `${GRAPH_API_BASE}/${this.phoneNumberId}/${endpoint}`;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (!res.ok) {
          const errorCode = data?.error?.code;
          const errorMsg = data?.error?.message || "Unknown Meta API error";

          // Transient error codes that warrant retry (Rate limit or internal generic)
          if (attempt < maxRetries && (errorCode === 4 || errorCode === 135000)) {
            const delay = Math.pow(2, attempt) * 1000;
            await new Promise((r) => setTimeout(r, delay));
            continue;
          }

          console.error(`[MetaCloudWhatsAppProvider] Meta API error (${res.status}):`, data);
          throw new Error(`Meta API ${errorCode}: ${errorMsg}`);
        }

        return data;
      } catch (err) {
        if (attempt >= maxRetries) throw err;
        await new Promise((r) => setTimeout(r, 1000 * attempt));
      }
    }
  }

  public async sendText(
    to: string,
    text: string,
    options?: WhatsAppSendOptions
  ): Promise<{ messageId: string; success: boolean }> {
    const recipient = this.cleanRecipient(to);
    const payload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: recipient,
      type: "text",
      text: {
        preview_url: options?.previewUrl ?? false,
        body: text,
      },
    };

    const res = await this.postWithRetry("messages", payload);
    const messageId = res?.messages?.[0]?.id || `msg-${Date.now()}`;
    return { messageId, success: true };
  }

  public async sendButtons(
    to: string,
    body: string,
    buttons: InteractiveButton[]
  ): Promise<{ messageId: string; success: boolean }> {
    const recipient = this.cleanRecipient(to);
    const validButtons = buttons.slice(0, 3).map((b) => ({
      type: "reply",
      reply: {
        id: b.id,
        title: b.title.slice(0, 20), // Meta limit 20 chars
      },
    }));

    const payload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: recipient,
      type: "interactive",
      interactive: {
        type: "button",
        body: { text: body },
        action: {
          buttons: validButtons,
        },
      },
    };

    const res = await this.postWithRetry("messages", payload);
    const messageId = res?.messages?.[0]?.id || `msg-${Date.now()}`;
    return { messageId, success: true };
  }

  public async sendList(
    to: string,
    header: string,
    body: string,
    buttonText: string,
    sections: InteractiveListSection[]
  ): Promise<{ messageId: string; success: boolean }> {
    const recipient = this.cleanRecipient(to);
    const payload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: recipient,
      type: "interactive",
      interactive: {
        type: "list",
        header: { type: "text", text: header.slice(0, 60) },
        body: { text: body.slice(0, 1024) },
        action: {
          button: buttonText.slice(0, 20),
          sections: sections.slice(0, 3).map((sec) => ({
            title: sec.title.slice(0, 24),
            rows: sec.rows.slice(0, 10).map((r) => ({
              id: r.id,
              title: r.title.slice(0, 24),
              description: r.description ? r.description.slice(0, 72) : undefined,
            })),
          })),
        },
      },
    };

    const res = await this.postWithRetry("messages", payload);
    const messageId = res?.messages?.[0]?.id || `msg-${Date.now()}`;
    return { messageId, success: true };
  }

  public async sendImage(
    to: string,
    imageUrl: string,
    caption?: string
  ): Promise<{ messageId: string; success: boolean }> {
    const recipient = this.cleanRecipient(to);
    const payload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: recipient,
      type: "image",
      image: {
        link: imageUrl,
        caption: caption ? caption.slice(0, 1024) : undefined,
      },
    };

    const res = await this.postWithRetry("messages", payload);
    const messageId = res?.messages?.[0]?.id || `msg-${Date.now()}`;
    return { messageId, success: true };
  }

  public async sendAudio(
    to: string,
    audioUrl: string
  ): Promise<{ messageId: string; success: boolean }> {
    const recipient = this.cleanRecipient(to);
    const payload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: recipient,
      type: "audio",
      audio: {
        link: audioUrl,
      },
    };

    const res = await this.postWithRetry("messages", payload);
    const messageId = res?.messages?.[0]?.id || `msg-${Date.now()}`;
    return { messageId, success: true };
  }

  public async sendLocation(
    to: string,
    latitude: number,
    longitude: number,
    name?: string,
    address?: string
  ): Promise<{ messageId: string; success: boolean }> {
    const recipient = this.cleanRecipient(to);
    const payload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: recipient,
      type: "location",
      location: {
        latitude,
        longitude,
        name: name || "Field Acreage Location",
        address: address || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
      },
    };

    const res = await this.postWithRetry("messages", payload);
    const messageId = res?.messages?.[0]?.id || `msg-${Date.now()}`;
    return { messageId, success: true };
  }

  public async sendTemplate(
    to: string,
    templateName: string,
    languageCode: string,
    components?: any[]
  ): Promise<{ messageId: string; success: boolean }> {
    const recipient = this.cleanRecipient(to);
    const payload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: recipient,
      type: "template",
      template: {
        name: templateName,
        language: { code: languageCode },
        components: components || [],
      },
    };

    const res = await this.postWithRetry("messages", payload);
    const messageId = res?.messages?.[0]?.id || `msg-${Date.now()}`;
    return { messageId, success: true };
  }

  public async downloadMedia(mediaId: string): Promise<{ buffer: Buffer; mimeType: string }> {
    if (!this.token) {
      throw new Error("WHATSAPP_TOKEN missing for media download");
    }

    // 1. Get media URL
    const metaRes = await fetch(`${GRAPH_API_BASE}/${mediaId}`, {
      headers: { Authorization: `Bearer ${this.token}` },
    });
    if (!metaRes.ok) {
      throw new Error(`Failed to retrieve media metadata: ${metaRes.statusText}`);
    }
    const mediaMeta = await metaRes.json();
    const downloadUrl = mediaMeta?.url;
    const mimeType = mediaMeta?.mime_type || "application/octet-stream";

    if (!downloadUrl) {
      throw new Error("Media metadata did not contain download URL");
    }

    // 2. Fetch binary buffer
    const binaryRes = await fetch(downloadUrl, {
      headers: { Authorization: `Bearer ${this.token}` },
    });
    if (!binaryRes.ok) {
      throw new Error(`Failed to download media binary: ${binaryRes.statusText}`);
    }

    const arrayBuffer = await binaryRes.arrayBuffer();
    return {
      buffer: Buffer.from(arrayBuffer),
      mimeType,
    };
  }
}
