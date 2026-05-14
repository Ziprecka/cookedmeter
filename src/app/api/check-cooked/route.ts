import OpenAI from "openai";
import { NextResponse } from "next/server";
import { COOKED_SYSTEM_PROMPT } from "@/lib/prompts/cookedPrompt";
import { buildFallbackResult, getCookedLevel } from "@/lib/cooked-utils";
import {
  cookedRequestSchema,
  cookedResultSchema,
  type CookedResult,
} from "@/lib/schemas";

const cookedResultJsonSchema = {
  name: "cooked_meter_result",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      cooked_score: { type: ["number", "null"], minimum: 0, maximum: 100 },
      cooked_level: { type: "string" },
      cooked_category: { type: "string" },
      seriousness_level: { type: "string" },
      one_line_diagnosis: { type: "string" },
      why_you_are_cooked: {
        type: "array",
        items: { type: "string" },
        maxItems: 5,
      },
      why_you_might_not_be_cooked: {
        type: "array",
        items: { type: "string" },
        maxItems: 4,
      },
      recovery_plan: {
        type: "array",
        items: { type: "string" },
        maxItems: 5,
      },
      meme_verdict: { type: "string" },
      final_line: { type: "string" },
      share_card_summary: { type: "string" },
      safe_mode: { type: "boolean" },
    },
    required: [
      "cooked_score",
      "cooked_level",
      "cooked_category",
      "seriousness_level",
      "one_line_diagnosis",
      "why_you_are_cooked",
      "why_you_might_not_be_cooked",
      "recovery_plan",
      "meme_verdict",
      "final_line",
      "share_card_summary",
      "safe_mode",
    ],
  },
} as const;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = cookedRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid cooked request.",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({
      result: buildFallbackResult(parsed.data),
      mode: "demo",
    });
  }

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
      temperature: 0.9,
      response_format: {
        type: "json_schema",
        json_schema: cookedResultJsonSchema,
      },
      messages: [
        { role: "system", content: COOKED_SYSTEM_PROMPT },
        {
          role: "user",
          content: [
            `Situation: ${parsed.data.situation}`,
            "Infer cooked_category, intensity/tone, risk type, and seriousness_level automatically.",
            "Make the roast specific, useful, and shareable. Keep every bullet short.",
          ].join("\n"),
        },
      ],
    });

    const content = completion.choices[0]?.message.content;
    if (!content) throw new Error("The oven returned an empty tray.");

    const raw = JSON.parse(content) as CookedResult;
    const normalized = {
      ...raw,
      cooked_score:
        raw.cooked_score === null ? null : Math.round(raw.cooked_score),
      cooked_level:
        raw.cooked_score === null
          ? raw.cooked_level || "Safe Mode"
          : getCookedLevel(Math.round(raw.cooked_score)),
    };
    const result = cookedResultSchema.parse(normalized);

    return NextResponse.json({ result, mode: "live" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        error: "CookedMeter overheated. Try again in a second.",
      },
      { status: 500 },
    );
  }
}
