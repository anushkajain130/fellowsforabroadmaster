import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getUserApplications = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const applications = await ctx.db.query("applications").withIndex("by_user", (q) => q.eq("userId", userId)).collect();
    
    const applicationsWithPrograms = await Promise.all(
      applications.map(async (app) => {
        const program = await ctx.db.get(app.programId);
        return { ...app, program };
      })
    );

    return applicationsWithPrograms;
  },
});

export const get = query({
  args: { id: v.id("applications") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const application = await ctx.db.get(args.id);
    if (!application) return null;

    // Check if user owns this application or is admin
    const profile = await ctx.db.query("userProfiles").withIndex("by_user", (q) => q.eq("userId", userId)).first();
    if (application.userId !== userId && !profile?.isAdmin) {
      throw new Error("Not authorized");
    }

    const program = await ctx.db.get(application.programId);
    return { ...application, program };
  },
});

export const create = mutation({
  args: { programId: v.id("programs") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if user already has an application for this program
    const existingApp = await ctx.db.query("applications")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("programId"), args.programId))
      .first();

    if (existingApp) {
      throw new Error("You already have an application for this program");
    }

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    return await ctx.db.insert("applications", {
      userId,
      programId: args.programId,
      status: "draft",
      personalInfo: {
        firstName: "",
        lastName: "",
        email: user.email || "",
        phone: "",
        dateOfBirth: "",
        nationality: "",
        address: "",
      },
      academicInfo: {
        currentDegree: "",
        university: "",
        gpa: "",
        graduationYear: "",
        fieldOfStudy: "",
      },
      documents: {},
      essays: {
        whyThisProgram: "",
        careerGoals: "",
        personalStatement: "",
      },
    });
  },
});

export const updatePersonalInfo = mutation({
  args: {
    applicationId: v.id("applications"),
    personalInfo: v.object({
      firstName: v.string(),
      lastName: v.string(),
      email: v.string(),
      phone: v.string(),
      dateOfBirth: v.string(),
      nationality: v.string(),
      address: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const application = await ctx.db.get(args.applicationId);
    if (!application || application.userId !== userId) {
      throw new Error("Not authorized");
    }

    await ctx.db.patch(args.applicationId, {
      personalInfo: args.personalInfo,
    });
  },
});

export const updateAcademicInfo = mutation({
  args: {
    applicationId: v.id("applications"),
    academicInfo: v.object({
      currentDegree: v.string(),
      university: v.string(),
      gpa: v.string(),
      graduationYear: v.string(),
      fieldOfStudy: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const application = await ctx.db.get(args.applicationId);
    if (!application || application.userId !== userId) {
      throw new Error("Not authorized");
    }

    await ctx.db.patch(args.applicationId, {
      academicInfo: args.academicInfo,
    });
  },
});

export const updateEssays = mutation({
  args: {
    applicationId: v.id("applications"),
    essays: v.object({
      whyThisProgram: v.string(),
      careerGoals: v.string(),
      personalStatement: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const application = await ctx.db.get(args.applicationId);
    if (!application || application.userId !== userId) {
      throw new Error("Not authorized");
    }

    await ctx.db.patch(args.applicationId, {
      essays: args.essays,
    });
  },
});

export const submit = mutation({
  args: { applicationId: v.id("applications") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const application = await ctx.db.get(args.applicationId);
    if (!application || application.userId !== userId) {
      throw new Error("Not authorized");
    }

    if (application.status !== "draft") {
      throw new Error("Application has already been submitted");
    }

    await ctx.db.patch(args.applicationId, {
      status: "submitted",
      submittedAt: Date.now(),
    });

    // Update program applicant count
    const program = await ctx.db.get(application.programId);
    if (program) {
      await ctx.db.patch(application.programId, {
        currentApplicants: program.currentApplicants + 1,
      });
    }

    // Create notification
    await ctx.db.insert("notifications", {
      userId,
      title: "Application Submitted",
      message: `Your application has been successfully submitted and is now under review.`,
      type: "application_update",
      isRead: false,
      applicationId: args.applicationId,
    });
  },
});

export const getAllApplications = query({
  args: { status: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if user is admin
    const profile = await ctx.db.query("userProfiles").withIndex("by_user", (q) => q.eq("userId", userId)).first();
    if (!profile?.isAdmin) throw new Error("Not authorized");

    let applications;
    if (args.status) {
      applications = await ctx.db.query("applications")
        .withIndex("by_status", (q) => q.eq("status", args.status as any))
        .collect();
    } else {
      applications = await ctx.db.query("applications").collect();
    }
    
    const applicationsWithDetails = await Promise.all(
      applications.map(async (app) => {
        const program = await ctx.db.get(app.programId);
        const user = await ctx.db.get(app.userId);
        return { ...app, program, user };
      })
    );

    return applicationsWithDetails;
  },
});

export const updateStatus = mutation({
  args: {
    applicationId: v.id("applications"),
    status: v.union(
      v.literal("under_review"),
      v.literal("accepted"),
      v.literal("rejected"),
      v.literal("waitlisted")
    ),
    reviewerNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if user is admin
    const profile = await ctx.db.query("userProfiles").withIndex("by_user", (q) => q.eq("userId", userId)).first();
    if (!profile?.isAdmin) throw new Error("Not authorized");

    const application = await ctx.db.get(args.applicationId);
    if (!application) throw new Error("Application not found");

    await ctx.db.patch(args.applicationId, {
      status: args.status,
      reviewedAt: Date.now(),
      reviewerNotes: args.reviewerNotes,
    });

    // Create notification for applicant
    await ctx.db.insert("notifications", {
      userId: application.userId,
      title: "Application Status Update",
      message: `Your application status has been updated to: ${args.status.replace('_', ' ').toUpperCase()}`,
      type: "application_update",
      isRead: false,
      applicationId: args.applicationId,
    });
  },
});
