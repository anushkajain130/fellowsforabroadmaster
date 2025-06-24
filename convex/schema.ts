// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

/* ──────────────────────────────────────────────────────
 * Extra index for the users table
 * ──────────────────────────────────────────────────── */
// convex/schema.ts
const authExtraTables = {
  users: defineTable({
    // Required field you added
    tokenIdentifier: v.string(),
    
    // Standard Convex Auth fields (all optional)
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    
    // Add any other custom fields you need here
  }).index("by_tokenIdentifier", ["tokenIdentifier"]),
};


/* ──────────────────────────────────────────────────────
 * Your existing application-specific tables
 * (exactly the same definitions you posted)
 * ──────────────────────────────────────────────────── */
const applicationTables = {
  programs: defineTable({
    title: v.string(),
    description: v.string(),
    university: v.string(),
    country: v.string(),
    degree: v.string(),
    duration: v.string(),
    applicationDeadline: v.string(),
    requirements: v.array(v.string()),
    benefits: v.array(v.string()),
    eligibility: v.array(v.string()),
    imageUrl: v.optional(v.string()),
    isActive: v.boolean(),
    maxApplicants: v.number(),
    currentApplicants: v.number(),
  })
    .index("by_country", ["country"])
    .index("by_active", ["isActive"]),

  applications: defineTable({
    userId: v.id("users"),
    programId: v.id("programs"),
    status: v.union(
      v.literal("draft"),
      v.literal("submitted"),
      v.literal("under_review"),
      v.literal("accepted"),
      v.literal("rejected"),
      v.literal("waitlisted"),
    ),
    personalInfo: v.object({
      firstName: v.string(),
      lastName: v.string(),
      email: v.string(),
      phone: v.string(),
      dateOfBirth: v.string(),
      nationality: v.string(),
      address: v.string(),
    }),
    academicInfo: v.object({
      currentDegree: v.string(),
      university: v.string(),
      gpa: v.string(),
      graduationYear: v.string(),
      fieldOfStudy: v.string(),
    }),
    documents: v.object({
      transcriptId: v.optional(v.id("_storage")),
      cvId: v.optional(v.id("_storage")),
      personalStatementId: v.optional(v.id("_storage")),
      recommendationLettersIds: v.optional(v.array(v.id("_storage"))),
    }),
    essays: v.object({
      whyThisProgram: v.string(),
      careerGoals: v.string(),
      personalStatement: v.string(),
    }),
    submittedAt: v.optional(v.number()),
    reviewedAt: v.optional(v.number()),
    reviewerNotes: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_program", ["programId"])
    .index("by_status", ["status"]),

  userProfiles: defineTable({
    userId: v.id("users"),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    phone: v.optional(v.string()),
    dateOfBirth: v.optional(v.string()),
    nationality: v.optional(v.string()),
    address: v.optional(v.string()),
    profilePictureId: v.optional(v.id("_storage")),
    isAdmin: v.boolean(),
  })
    .index("by_user", ["userId"])
    .index("by_admin", ["isAdmin"]),

  notifications: defineTable({
    userId: v.id("users"),
    title: v.string(),
    message: v.string(),
    type: v.union(
      v.literal("application_update"),
      v.literal("deadline_reminder"),
      v.literal("system_announcement"),
    ),
    isRead: v.boolean(),
    applicationId: v.optional(v.id("applications")),
  })
    .index("by_user", ["userId"])
    .index("by_read", ["isRead"]),

  blogs: defineTable({
    title: v.string(),
    content: v.string(),
    excerpt: v.string(),
    authorId: v.id("users"),
    tags: v.array(v.string()),
    imageUrl: v.optional(v.string()),
    isPublished: v.boolean(),
    publishedAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  })
    .index("by_author", ["authorId"])
    .index("by_published", ["isPublished"])
    .index("by_published_date", ["isPublished", "publishedAt"]),

  comments: defineTable({
    blogId: v.id("blogs"),
    authorId: v.id("users"),
    content: v.string(),
    updatedAt: v.optional(v.number()),
  })
    .index("by_blog", ["blogId"])
    .index("by_author", ["authorId"]),
};

/* ──────────────────────────────────────────────────────
 * Slack / Discord-style chat tables
 * ──────────────────────────────────────────────────── */
const chatTables = {
  workspaces: defineTable({
    name: v.string(),
    ownerId: v.id("users"),
    createdAt: v.number(),
  }).index("by_owner", ["ownerId"]),

  memberships: defineTable({
    workspaceId: v.id("workspaces"),
    userId: v.id("users"),
    roles: v.array(v.string()), // ["owner","admin","member"]
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_user", ["userId"]),

  channels: defineTable({
    workspaceId: v.id("workspaces"),
    name: v.string(),
    isPrivate: v.boolean(),
    isDM: v.boolean(),
    createdBy: v.id("users"),
    createdAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_workspace_privacy", ["workspaceId", "isPrivate"]),

  channelMembers: defineTable({
    channelId: v.id("channels"),
    userId: v.id("users"),
  })
    .index("by_channel", ["channelId"])
    .index("by_user", ["userId"]),

  messages: defineTable({
    channelId: v.id("channels"),
    authorId: v.id("users"),
    text: v.string(),
    parentId: v.optional(v.id("messages")),
    createdAt: v.number(),
    editedAt: v.optional(v.number()),
    deleted: v.boolean(),
  }).index("by_channel", ["channelId"]),

  reactions: defineTable({
    messageId: v.id("messages"),
    userId: v.id("users"),
    emoji: v.string(),
  })
    .index("by_message", ["messageId"])
    .index("by_message_emoji", ["messageId", "emoji"]),

  files: defineTable({
    messageId: v.id("messages"),
    storageId: v.id("_storage"),
    filename: v.string(),
    size: v.number(),
  }).index("by_message", ["messageId"]),

  presence: defineTable({
    workspaceId: v.id("workspaces"),
    userId: v.id("users"),
    lastSeen: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_user", ["userId"]),
};

/* ──────────────────────────────────────────────────────
 * Export the merged schema
 * ──────────────────────────────────────────────────── */
export default defineSchema({
  ...authTables,       // tables from @convex-dev/auth
  ...authExtraTables,  // adds the by_tokenIdentifier index to users
  ...applicationTables,
  ...chatTables,
}, 
{
  schemaValidation: false,  // ← Add this temporarily
}
);
