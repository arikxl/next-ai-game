import OpenAI from "openai";
import { v } from "convex/values";
import { internalAction, internalQuery, mutation } from "./_generated/server";

import { api, internal } from "./_generated/api";

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
            create for me a text based adventure RPG title about a ${adventure.characterClass}
             named ${adventure.characterName} in ${adventure.adventurePlace}.
            
            then You are a dungeon master who is going to run this text based adventure RPG for me (${adventure.characterName}).
            You will need to setup the adventure for me that takes place in ${adventure.adventurePlace}, involve having me fight random enemy encounters, reward me with loot after killing enemies, give me goals and quests, and finally let me know when i finish the overall adventure.
            
            When i'm fighting enemies, please ask me to roll 6 sides a dices, with a 1 being the worst outcome of the scenario, and a 6 being the best outcome of the scenario.
            Do not roll the dice for me, I as a player should input this and you need to describe the outcome with my input.

            During this entire time, please track my health points which will start at 10,
            my character class which is a ${adventure.characterClass}, and my inventory which will start with 
            - a sword that deals a base damage of 1
            - a bronze helmet
            - a health potion which heals 3 hp

            the adventure should have some of the following
            - the hero must clear out ${adventure.adventurePlace} from evil enemies
            - the game has 3 levels
            - each level has 1 set of enemies to fight
            - each level has some riddles
            - each level has some chests
            - the final level has a boss
            
            Given this scenario, please ask the player for their initial action. 
            `
        const completion = await openai.chat.completions.create({
            messages: [{
                role: 'user',
                content: input
            }],
            model: 'gpt-3.5-turbo'
        })

        const response = completion.choices[0].message.content ?? '';
        await ctx.runMutation(api.chat.insertEntry, {
            input, response, adventureId: args.adventureId
        })
    },
});