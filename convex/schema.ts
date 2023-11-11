import { v } from "convex/values";
import { defineSchema, defineTable } from "convex/server";

export default defineSchema({
    entries: defineTable({
        input: v.string(),
        response: v.string(),
        imageUrl: v.optional(v.string()),
        adventureId: v.id('adventures'),
        health:v.optional(v.number()),
        inventory:v.optional(v.array(v.string()))
    }),
    adventures: defineTable({
        characterClass: v.string(),
        characterName: v.string(),
        adventurePlace: v.string(),
        // response: v.string(),
    }),
    items: defineTable({
        itemName: v.string(),
        imageUrl: v.optional(v.string())
    }),
});