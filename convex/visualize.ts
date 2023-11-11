import OpenAI from "openai";
import { v } from "convex/values";
import { action, internalAction, internalMutation, internalQuery, mutation } from "./_generated/server";

import { api, internal } from "./_generated/api";

const openai = new OpenAI();

export const visualizeLatestEntries = internalAction({
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
                // content: `
                // Summarize the following adventure of a text based RPG.
                //  please give a one sentence visualize description for an artist who can use the description to paint us picture.

                //  here is the history of the adventure with the most recent events being at the end:
                //   "${previousEntriesCombined}"`
                content: `
                ${previousEntriesCombined}
                Using the above adventure history, please describe the current scene so that I can use the description to draw a picture. 
                `
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

        const imageData = await fetch(imageUrl);
        const image = await imageData.blob();
        const storageId = await ctx.storage.store(image);

        await ctx.runMutation(internal.visualize.addEntryVisualization, {
            entryId: args.entryId,
            imageUrl: await ctx.storage.getUrl(storageId) ?? ''
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


//             Given a list of previous adventure entries for a text adventure game we are playing,
// please create a descriptive prompt for an artist with no context of the adventure,
//     so that he can draw the most recent events in the adventure.