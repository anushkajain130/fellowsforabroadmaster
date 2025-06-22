import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

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
  }).index("by_country", ["country"])
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
      v.literal("waitlisted")
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
  }).index("by_user", ["userId"])
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
  }).index("by_user", ["userId"])
    .index("by_admin", ["isAdmin"]),

  notifications: defineTable({
    userId: v.id("users"),
    title: v.string(),
    message: v.string(),
    type: v.union(
      v.literal("application_update"),
      v.literal("deadline_reminder"),
      v.literal("system_announcement")
    ),
    isRead: v.boolean(),
    applicationId: v.optional(v.id("applications")),
  }).index("by_user", ["userId"])
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
  }).index("by_author", ["authorId"])
    .index("by_published", ["isPublished"])
    .index("by_published_date", ["isPublished", "publishedAt"]),

  comments: defineTable({
    blogId: v.id("blogs"),
    authorId: v.id("users"),
    content: v.string(),
    updatedAt: v.optional(v.number()),
  }).index("by_blog", ["blogId"])
    .index("by_author", ["authorId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
