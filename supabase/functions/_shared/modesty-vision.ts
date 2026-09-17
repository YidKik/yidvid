// Shared thumbnail modesty check powered by Lovable AI vision.
// Returns a verdict for a single video based on its thumbnail image + text metadata.

export type Verdict = "allow" | "block" | "review";

export interface VisionVerdict {
  verdict: Verdict;
  reasons: string[];
  confidence: number;
}

export class GatewayError extends Error {
  status: number;
  retryable: boolean;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    // Only 429 / 5xx are retryable. 402/403 are circuit breakers.
    this.retryable = status === 429 || status >= 500;
  }
}

const MODEL = "openai/gpt-6-astra";

const SYSTEM_RULES = `You are a strict content filter for a kosher Jewish video platform (YidVid).
Look at the video thumbnail image together with the title and channel name.

Block the video if the thumbnail shows ANY of these:
- a woman or a girl (any age past early childhood), even fully dressed, even in the background, even partially visible
- immodest clothing on anyone, swimwear, underwear, suggestive poses
- nudity, sexual content, romance between men and women
- violence, weapons used threateningly, drugs, or other content unsuitable for a religious family audience

Allow the video only when you are confident none of the above appear.
Use "review" only when the image is unclear, unreadable, or you genuinely cannot tell.
A drawing, cartoon, or illustration of a woman or girl counts as a woman or girl.
Answer in the required JSON format with short plain-English reasons.`;

const RESPONSE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    verdict: { type: "string", enum: ["allow", "block", "review"] },
    reasons: { type: "array", items: { type: "string" } },
    confidence: { type: "number" },
  },
  required: ["verdict", "reasons", "confidence"],
};

async function readSseText(res: Response): Promise<string> {
  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let text = "";
  let completedText = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.startsWith("data:")) continue;
      const payload = line.slice(5).trim();
      if (!payload || payload === "[DONE]") continue;
      try {
        const evt = JSON.parse(payload);
        if (evt.type === "response.output_text.delta" && typeof evt.delta === "string") {
          text += evt.delta;
        } else if (evt.type === "response.completed" && evt.response?.output_text) {
          completedText = evt.response.output_text;
        }
      } catch {
        // ignore partial / non-JSON keepalive lines
      }
    }
  }

  return (text || completedText).trim();
}

export async function analyzeThumbnail(input: {
  title?: string | null;
  description?: string | null;
  channelName?: string | null;
  thumbnailUrl?: string | null;
}): Promise<VisionVerdict> {
  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) throw new GatewayError(401, "LOVABLE_API_KEY is not configured");

  const thumbnailUrl = (input.thumbnailUrl || "").trim();
  if (!thumbnailUrl || !/^https?:\/\//i.test(thumbnailUrl)) {
    return {
      verdict: "review",
      reasons: ["No thumbnail image available to check."],
      confidence: 0,
    };
  }

  const promptText = [
    `Title: ${input.title || "(none)"}`,
    `Channel: ${input.channelName || "(unknown)"}`,
    input.description ? `Description: ${String(input.description).slice(0, 600)}` : "",
    "",
    "Judge the attached thumbnail image against the rules.",
  ]
    .filter(Boolean)
    .join("\n");

  const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": apiKey,
      "X-Lovable-AIG-SDK": "fetch",
    },
    body: JSON.stringify({
      model: MODEL,
      stream: true,
      instructions: SYSTEM_RULES,
      input: [
        {
          role: "user",
          content: [
            { type: "input_text", text: promptText },
            { type: "input_image", image_url: thumbnailUrl },
          ],
        },
      ],
      reasoning: { effort: "low" },
      include: ["reasoning.encrypted_content"],
      store: false,
      text: {
        format: {
          type: "json_schema",
          name: "modesty_verdict",
          strict: true,
          schema: RESPONSE_SCHEMA,
        },
      },
    }),
  });

  if (!res.ok || !res.body) {
    const body = await res.text().catch(() => "");
    // An unreachable / unreadable thumbnail is not a gateway failure — send it to review.
    if (res.status === 400 && /downloading file|invalid_value|unsupported/i.test(body)) {
      return {
        verdict: "review",
        reasons: ["The thumbnail image could not be opened for checking."],
        confidence: 0,
      };
    }
    throw new GatewayError(res.status, `AI gateway error ${res.status}: ${body.slice(0, 300)}`);
  }

  const raw = await readSseText(res);
  if (!raw) {
    return { verdict: "review", reasons: ["AI returned no answer."], confidence: 0 };
  }

  try {
    const parsed = JSON.parse(raw);
    const verdict: Verdict =
      parsed.verdict === "allow" || parsed.verdict === "block" ? parsed.verdict : "review";
    const reasons = Array.isArray(parsed.reasons)
      ? parsed.reasons.map((r: unknown) => String(r)).slice(0, 5)
      : [];
    const confidence = Number.isFinite(parsed.confidence)
      ? Math.max(0, Math.min(1, Number(parsed.confidence)))
      : 0.5;
    return { verdict, reasons, confidence };
  } catch {
    return { verdict: "review", reasons: ["Could not read the AI answer."], confidence: 0 };
  }
}

// Maps a verdict onto the columns the app already reads.
export function verdictToRow(v: VisionVerdict) {
  const status =
    v.verdict === "allow" ? "approved" : v.verdict === "block" ? "rejected" : "manual_review";
  const score = v.verdict === "allow" ? 9 : v.verdict === "block" ? 1 : 5;
  return {
    content_analysis_status: status as "approved" | "rejected" | "manual_review",
    analysis_score: score,
    manual_review_required: v.verdict === "review",
    analysis_timestamp: new Date().toISOString(),
    analysis_details: {
      analyzer: "lovable-ai-vision-v1",
      verdict: v.verdict,
      confidence: v.confidence,
      reasoning: v.reasons.join(" "),
      thumbnailAnalysis: {
        analyzed: true,
        safe: v.verdict === "allow",
        detected: v.reasons,
      },
      analyzed_at: new Date().toISOString(),
    },
  };
}
