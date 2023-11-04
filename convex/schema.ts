import { v } from "convex/values";
import { defineSchema, defineTable } from "convex/server";

export default defineSchema({
    entries: defineTable({
        input: v.string(),
        response: v.string(),
        adventureId: v.id('adventures'),
    }),
    adventures: defineTable({
        characterClass: v.string(),
        characterName: v.string(),
        adventurePlace: v.string(),
        // response: v.string(),
    }),
});