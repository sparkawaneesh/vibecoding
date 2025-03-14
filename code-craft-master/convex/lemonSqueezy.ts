"use node";
// @ts-ignore
import { v } from "convex/values";
// @ts-ignore
import { internalAction, ActionCtx } from "./_generated/server";
import { createHmac } from "crypto";

const webhookSecret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET!;

function verifySignature(payload: string, signature: string): boolean {
  const hmac = createHmac("sha256", webhookSecret);
  const computedSignature = hmac.update(payload).digest("hex");
  return signature === computedSignature;
}

interface WebhookArgs {
  payload: string;
  signature: string;
}

export const verifyWebhook = internalAction({
  args: {
    payload: v.string(),
    signature: v.string(),
  },
  // @ts-ignore
  handler: async (ctx, args: WebhookArgs) => {
    const isValid = verifySignature(args.payload, args.signature);

    if (!isValid) {
      throw new Error("Invalid signature");
    }

    return JSON.parse(args.payload);
  },
});
