import { singingEvaluationSchema } from "../lib/openai";

test("singing evaluation schema requires fields", () => {
  expect(singingEvaluationSchema.schema).toBeDefined();
  const required = singingEvaluationSchema.schema.required as string[];
  expect(required).toContain("overall_score");
  expect(required).toContain("drills");
});
