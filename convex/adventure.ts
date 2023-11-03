import { v } from "convex/values";
import { action, internalAction, internalQuery, mutation, query } from "./_generated/server";
import { api, internal } from "./_generated/api";
import OpenAI from "openai";

const openai = new OpenAI();

export const createAdventure = mutation({
    args: {
        characterClass: v.string(),
        characterName: v.string(),
        adventurePlace: v.string(),
    },
    handler: async (ctx, args) => {
        const id = await ctx.db.insert('adventures', {
            characterClass: args.characterClass,
            characterName: args.characterName,
            adventurePlace: args.adventurePlace,
        })

        await ctx.scheduler.runAfter(0, internal.adventure.setupAdventureEntries, {
            adventureId: id,
        })

        return id;
    }
});

export const getAdventure = internalQuery({
    args: {
        adventureId: v.id('adventures'),
    },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.adventureId)
    }
});

export const setupAdventureEntries = internalAction({
    args: {
        adventureId: v.id('adventures'),
    },

    handler: async (ctx, args) => {
        const adventure = await ctx.runQuery(internal.adventure.getAdventure, args)

        if (!adventure) throw new Error('Adventure Not Found');

        const input = `
            Give me a name of a book with a ${adventure.characterClass} 
            that is name is ${adventure.characterName}
            in the ${adventure.adventurePlace}
            `



        const completion = await openai.chat.completions.create({
            messages: [{
                role: 'user',
                content: input
            }],
            model: 'gpt-3.5-turbo'
        })

        // const input = args.message;
        const response = completion.choices[0].message.content ?? '';
        await ctx.runMutation(api.chat.insertEntry, {
            input, response, adventureId: args.adventureId
        })
    },
});