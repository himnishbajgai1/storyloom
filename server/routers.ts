import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { invokeLLM } from "./_core/llm";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { createStorySequence, getStorySequencesByUserId } from "./db";

const copyResponseSchema = {
  type: "object" as const,
  properties: {
    headline: { type: "string" as const, description: "A short, memorable headline of at most 8 words." },
    caption: { type: "string" as const, description: "A warm, engaging caption of one or two sentences." },
    kicker: { type: "string" as const, description: "A tiny contextual label of at most 3 words." },
  },
  required: ["headline", "caption", "kicker"],
  additionalProperties: false,
};

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  story: router({
    listMine: protectedProcedure.query(async ({ ctx }) => {
      const rows = await getStorySequencesByUserId(ctx.user.id);
      return rows.map(row => ({ ...row, cards: JSON.parse(row.cardsJson) as unknown[] }));
    }),
    save: protectedProcedure
      .input(z.object({ name: z.string().min(1).max(160), cards: z.array(z.unknown()).min(1) }))
      .mutation(async ({ ctx, input }) => {
        const id = await createStorySequence({ userId: ctx.user.id, name: input.name, cardsJson: JSON.stringify(input.cards) });
        return { id, name: input.name };
      }),
    generateCopy: publicProcedure
      .input(z.object({ imageDataUrl: z.string().min(1), tone: z.string().default("warm and editorial"), cardNumber: z.number().int().min(1) }))
      .mutation(async ({ input }) => {
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: "You are an expert social storyteller and creative director. Write concise, human copy for an elegant photo story sequence. Avoid hashtags, emojis, generic marketing language, and invented facts. Return only valid JSON matching the requested schema.",
            },
            {
              role: "user",
              content: [
                { type: "text", text: `Create copy for story card ${input.cardNumber}. Tone: ${input.tone}. Make it feel specific to what is visible in the image, but never claim details that are not apparent.` },
                { type: "image_url", image_url: { url: input.imageDataUrl, detail: "low" } },
              ],
            },
          ],
          response_format: {
            type: "json_schema",
            json_schema: { name: "story_card_copy", strict: true, schema: copyResponseSchema },
          },
        });
        const raw = response.choices?.[0]?.message?.content;
        if (typeof raw !== "string") throw new Error("The copy generator returned an empty response.");
        return JSON.parse(raw) as { headline: string; caption: string; kicker: string };
      }),
  }),
});

export type AppRouter = typeof appRouter;
