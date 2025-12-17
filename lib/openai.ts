import OpenAI from "openai";

export const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const singingEvaluationSchema = {
  name: "singing_evaluation",
  strict: true,
  schema: {
    type: "object",
    properties: {
      overall_score: { type: "number" },
      scores: {
        type: "object",
        properties: {
          pitch_accuracy: { type: "number" },
          intonation_stability: { type: "number" },
          breath_control: { type: "number" },
          tone_quality: { type: "number" },
          resonance: { type: "number" },
          range_management: { type: "number" },
          diction: { type: "number" },
          dynamics: { type: "number" },
          musicality: { type: "number" },
          style_match: { type: "number" }
        }
      },
      highlights: { type: "array", items: { type: "string" } },
      bottlenecks: { type: "array", items: { type: "string" } },
      timecoded_notes: {
        type: "array",
        items: {
          type: "object",
          properties: {
            t0: { type: "number" },
            t1: { type: "number" },
            issue: {
              type: "string",
              enum: [
                "pitch_flat",
                "pitch_sharp",
                "rhythm_loose",
                "breath_support",
                "pronunciation",
                "dynamics",
                "tone"
              ]
            },
            detail: { type: "string" },
            fix: { type: "string" }
          },
          required: ["t0", "t1", "issue", "detail", "fix"]
        }
      },
      drills: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            how: { type: "string" },
            minutes_per_day: { type: "integer" }
          },
          required: ["name", "how", "minutes_per_day"]
        }
      },
      next_take_prompt: { type: "string" }
    },
    required: [
      "overall_score",
      "scores",
      "highlights",
      "bottlenecks",
      "timecoded_notes",
      "drills",
      "next_take_prompt"
    ],
    additionalProperties: false
  }
};
