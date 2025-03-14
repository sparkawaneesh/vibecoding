// @ts-ignore
import { v } from "convex/values";
// @ts-ignore
import { mutation, query, MutationCtx, QueryCtx } from "./_generated/server";

// Define query types
type QueryBuilder = {
  eq: (a: any, b: any) => boolean;
  field: (fieldName: string) => any;
};

interface UserArgs {
  userId: string;
  email: string;
  name: string;
}

interface UserIdArg {
  userId: string;
}

interface UpgradeToProArgs {
  email: string;
  lemonSqueezyCustomerId: string;
  lemonSqueezyOrderId: string;
  amount: number;
}

export const syncUser = mutation({
  args: {
    userId: v.string(),
    email: v.string(),
    name: v.string(),
  },
  handler: async (ctx: MutationCtx, args: UserArgs) => {
    const existingUser = await ctx.db
      .query("users")
      .filter((q: QueryBuilder) => q.eq(q.field("userId"), args.userId))
      .first();

    if (!existingUser) {
      await ctx.db.insert("users", {
        userId: args.userId,
        email: args.email,
        name: args.name,
        isPro: false,
      });
    }
  },
});

export const getUser = query({
  args: { userId: v.string() },

  handler: async (ctx: QueryCtx, args: UserIdArg) => {
    if (!args.userId) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_user_id")
      .filter((q: QueryBuilder) => q.eq(q.field("userId"), args.userId))
      .first();

    if (!user) return null;

    return user;
  },
});

export const upgradeToPro = mutation({
  args: {
    email: v.string(),
    lemonSqueezyCustomerId: v.string(),
    lemonSqueezyOrderId: v.string(),
    amount: v.number(),
  },
  handler: async (ctx: MutationCtx, args: UpgradeToProArgs) => {
    const user = await ctx.db
      .query("users")
      .filter((q: QueryBuilder) => q.eq(q.field("email"), args.email))
      .first();

    if (!user) throw new Error("User not found");

    await ctx.db.patch(user._id, {
      isPro: true,
      proSince: Date.now(),
      lemonSqueezyCustomerId: args.lemonSqueezyCustomerId,
      lemonSqueezyOrderId: args.lemonSqueezyOrderId,
    });

    return { success: true };
  },
});
