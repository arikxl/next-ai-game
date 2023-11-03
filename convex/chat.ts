import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { api } from "./_generated/api";
import OpenAI from "openai";

const openai = new OpenAI();

export const handlePlayerAction = action({
    args: {
        message: v.string(),
        adventureId: v.id('adventures'),
    },

    handler: async (ctx, args) => {

        const completion = await openai.chat.completions.create({
            messages: [{ role: 'user', content: args.message }],
            model: 'gpt-3.5-turbo'
        })

        const input = args.message;
        const response = completion.choices[0].message.content ?? '';
        await ctx.runMutation(api.chat.insertEntry, {
            input, response, adventureId: args.adventureId
        })
        return completion;
    },
});


export const insertEntry = mutation({
    args: {
        input: v.string(),
        response: v.string(),
        adventureId: v.id('adventures'),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert('entries', {
            input: args.input,
            response: args.response,
            adventureId: args.adventureId
        })
    }
});


export const getAllEntries = query({
    args: {
        adventureId: v.id('adventures')
    },
    handler: async (ctx, args) => {
        const entries = await ctx.db.query('entries')
            .filter((q) => q.eq(q.field('adventureId'), args.adventureId))
            .collect();
        return entries;
    }
})