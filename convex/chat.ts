import OpenAI from "openai";
import { v } from "convex/values";
import { action, internalQuery, mutation, query } from "./_generated/server";

import { api, internal } from "./_generated/api";

const openai = new OpenAI();

export const getEntriesForAdventure = internalQuery({
    args: {
        adventureId: v.id('adventures'),
    },
    handler: async (ctx, args) => {
        return ctx.db.query('entries')
            .filter((q) => q.eq(q.field('adventureId'), args.adventureId))
            .collect();
    }
})

export const handlePlayerAction = action({
    args: {
        message: v.string(),
        adventureId: v.id('adventures'),
    },

    handler: async (ctx, args) => {

        const entries = await ctx.runQuery(internal.chat.getEntriesForAdventure, {
            adventureId: args.adventureId,
        });

        const prefix = entries.map(entry => {
            return `${entry.input}\n\n${entry.response}`
        }).join("\n\n");

        const userPrompt = args.message;

        const completion = await openai.chat.completions.create({
            messages: [{ role: 'user', content: `${prefix}${userPrompt}`  }],
            model: 'gpt-3.5-turbo'
        })

        const input = args.message;
        const response = completion.choices[0].message.content ?? '';
        await ctx.runMutation(api.chat.insertEntry, {
            input, response, adventureId: args.adventureId
        })
        // return completion;
 
    },
});


export const insertEntry = mutation({
    args: {
        input: v.string(),
        response: v.string(),
        adventureId: v.id('adventures'),
    },
    handler: async (ctx, args) => {
        const entryId= await ctx.db.insert('entries', {
            input: args.input,
            response: args.response,
            adventureId: args.adventureId
        })
        await ctx.scheduler.runAfter(0,internal.visualize.visualizeLatestEntries, {
            adventureId: args.adventureId,
            entryId: entryId
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