import OpenAI from "openai";
import { v } from "convex/values";
import { action, internalAction, internalMutation, internalQuery, mutation } from "./_generated/server";

import { api, internal } from "./_generated/api";

const openai = new OpenAI();

export const visualizeLatestEntries = action({
    args: {
        adventureId: v.id('adventures'),
        entryId: v.id('entries'),
    },

    handler: async (ctx, args) => {
        const adventure = await ctx.runQuery(internal.adventure.getAdventure, {
            adventureId: args.adventureId
        })
        if (!adventure) throw new Error('Adventure Not Found');

        const entries = await ctx.runQuery(internal.chat.getEntriesForAdventure, {
            adventureId: args.adventureId,
        });

        const previousEntriesCombined = entries.map(entry => {
            return `${entry.input}\n\n${entry.response}`
        }).join("\n\n");


        const completion = await openai.chat.completions.create({
            messages: [{
                role: 'user',
                content: `Given a list of previous adventure entries for a text adventure game we are playing,
                 please create a descriptive prompt for an artist with no context of the adventure,
                 so that he can draw the most recent events in the adventure.
                 here is the history of the adventure: ${previousEntriesCombined}`
            }],
            model: 'gpt-3.5-turbo'
        })

        const response = completion.choices[0].message.content ?? '';
        console.log('response:', response)

        const imageFetchResponse = await fetch(`https://api.openai.com/v1/images/generations`, {
            method: 'POST',
            body: JSON.stringify({
                prompt: response,
                n: 1,
                size: '512x512'
            }),
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
            }
        })

        const imageResponse = await imageFetchResponse.json();
        const imageUrl = imageResponse.data[0].url;

        await ctx.runMutation(internal.visualize.addEntryVisualization, {
            entryId: args.entryId,
            imageUrl
        })
    },
});

export const addEntryVisualization = internalMutation({
    args: {
        entryId: v.id('entries'),
        imageUrl: v.string()
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.entryId, { 
            imageUrl: args.imageUrl
        })
    }
})