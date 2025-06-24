// convex/cleanup.ts
import { mutation } from "./_generated/server";

export const cleanupDuplicateUsers = mutation({
  args: {},
  handler: async (ctx) => {
    const allUsers = await ctx.db.query("users").collect();
    
    // Group users by tokenIdentifier
    const usersByToken = new Map<string, any[]>();
    
    for (const user of allUsers) {
      if (user.tokenIdentifier) {
        if (!usersByToken.has(user.tokenIdentifier)) {
          usersByToken.set(user.tokenIdentifier, []);
        }
        usersByToken.get(user.tokenIdentifier)!.push(user);
      }
    }
    
    // Remove duplicates, keeping the most recent one
    let deletedCount = 0;
    for (const [tokenId, users] of usersByToken) {
      if (users.length > 1) {
        // Sort by _creationTime (newest first) and keep the first one
        users.sort((a, b) => b._creationTime - a._creationTime);
        
        // Delete all but the first (newest) user
        for (let i = 1; i < users.length; i++) {
          await ctx.db.delete(users[i]._id);
          deletedCount++;
        }
        
        console.log(`Cleaned up ${users.length - 1} duplicates for token ${tokenId}`);
      }
    }
    
    return `Deleted ${deletedCount} duplicate users`;
  },
});

// convex/cleanup.ts (add this function)
export const fixNullTokenUsers = mutation({
  args: {},
  handler: async (ctx) => {
    // Get users with null/undefined tokenIdentifier
    const allUsers = await ctx.db.query("users").collect();
    const nullTokenUsers = allUsers.filter(u => !u.tokenIdentifier);
    
    console.log(`Found ${nullTokenUsers.length} users with null tokenIdentifier`);
    
    // Delete users with null tokenIdentifier (they're orphaned)
    for (const user of nullTokenUsers) {
      await ctx.db.delete(user._id);
      console.log("Deleted orphaned user:", user._id, user.email);
    }
    
    return `Deleted ${nullTokenUsers.length} orphaned users`;
  },
});
