import type { CookedRequest, CookedResult, StoredResult } from "./schemas";

export function getCookedLevel(score: number | null) {
  if (score === null) return "Safe Mode";
  if (score <= 10) return "Raw";
  if (score <= 25) return "Lightly Toasted";
  if (score <= 45) return "Simmering";
  if (score <= 65) return "Medium-Well";
  if (score <= 80) return "Crispy";
  if (score <= 94) return "Charred";
  return "Ashes";
}

export function getScoreTone(score: number | null) {
  if (score === null) return "from-cyan-300 to-lime-300";
  if (score <= 25) return "from-cyan-300 to-lime-300";
  if (score <= 65) return "from-lime-300 to-orange-400";
  if (score <= 94) return "from-orange-400 to-red-500";
  return "from-red-500 to-fuchsia-500";
}

export function excerpt(text: string, max = 120) {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max - 1)}...` : clean;
}

export function encodeShareState(stored: StoredResult) {
  if (typeof window === "undefined") return "";
  return window.btoa(unescape(encodeURIComponent(JSON.stringify(stored))));
}

export function decodeShareState(value: string) {
  try {
    return JSON.parse(decodeURIComponent(escape(atob(value)))) as StoredResult;
  } catch {
    return null;
  }
}

export function decodeShareStateServer(value: string) {
  try {
    return JSON.parse(Buffer.from(value, "base64").toString("utf8")) as StoredResult;
  } catch {
    try {
      return JSON.parse(
        decodeURIComponent(Buffer.from(value, "base64").toString("utf8")),
      ) as StoredResult;
    } catch {
      return null;
    }
  }
}

export function buildStoredResult(
  request: CookedRequest,
  result: CookedResult,
): StoredResult {
  return {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}`,
    situation: request.situation,
    result,
    createdAt: new Date().toISOString(),
  };
}

export function buildFallbackResult(request: CookedRequest): CookedResult {
  const text = request.situation.toLowerCase();
  const danger =
    /(suicide|self-harm|kill myself|hurt myself|abuse|immediate danger)/i.test(
      text,
    );

  if (danger) {
    return {
      cooked_score: null,
      cooked_level: "Safe Mode",
      cooked_category: "Safety",
      seriousness_level: "Immediate support",
      one_line_diagnosis:
        "This sounds bigger than a roast, so CookedMeter is putting the bit down.",
      why_you_are_cooked: [],
      why_you_might_not_be_cooked: [
        "You do not have to solve this alone or turn it into a joke right now.",
        "A real person nearby can help you get through the next few minutes.",
      ],
      recovery_plan: [
        "If there is immediate danger, call emergency services now.",
        "If you are in the U.S. or Canada, call or text 988 for crisis support.",
        "Message or call someone you trust and say plainly that you need help.",
      ],
      meme_verdict: "No meme verdict. Human mode activated.",
      final_line: "You matter more than the joke.",
      share_card_summary: "Safe Mode: get real support right now.",
      safe_mode: true,
    };
  }

  let score = 34;
  if (/tomorrow|2 am|no backup|boss|exam|deadline/.test(text)) score += 22;
  if (/spent|\$|ads|booking|debt|loan|rent|bought/.test(text)) score += 14;
  if (/no money|move out|housing|deposit|evict|eviction/.test(text)) score += 24;
  if (/ex|date|crush|relationship|texted/.test(text)) score += 16;
  if (/facebook marketplace|project car|quit/.test(text)) score += 18;
  score = Math.max(6, Math.min(98, score));
  const level = getCookedLevel(score);
  const category = /rent|move|money|\$|spent|debt|loan/.test(text)
    ? "Money / Housing"
    : /ex|date|crush|relationship|texted/.test(text)
      ? "Dating"
      : /exam|school|textbook/.test(text)
        ? "School"
        : /boss|job|work/.test(text)
          ? "Career"
          : "General";

  return {
    cooked_score: score,
    cooked_level: level,
    cooked_category: category,
    seriousness_level: score > 80 ? "High" : score > 55 ? "Medium" : "Low",
    one_line_diagnosis:
      "You are not done, but the smoke alarm is definitely learning your name.",
    why_you_are_cooked: [
      "The timing is giving last-minute DLC and you are somehow the unpaid beta tester.",
      "There is a real consequence hiding under the funny wording, wearing a tiny little fake mustache.",
      "Your current plan appears to be mostly vibes, panic, and a phone at 12% battery.",
    ],
    why_you_might_not_be_cooked: [
      "The situation still has moving parts you can influence.",
      "A fast, boring next step beats a dramatic spiral.",
    ],
    recovery_plan: [
      "Name the one outcome you need to avoid first.",
      "Do the smallest useful action in the next 20 minutes.",
      "Ask one specific person for one specific piece of help.",
      "Stop adding new chaos until the existing chaos clocks out.",
    ],
    meme_verdict: `${level}. The group chat is concerned, but they did pull up a chair.`,
    final_line: "You can still recover, but stop making decisions like the terms and conditions are chasing you.",
    share_card_summary: `${score}% cooked: ${level}. The evidence is loud.`,
    safe_mode: false,
  };
}
