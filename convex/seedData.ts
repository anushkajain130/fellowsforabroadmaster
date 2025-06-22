import { mutation } from "./_generated/server";

export const seedPrograms = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if programs already exist
    const existingPrograms = await ctx.db.query("programs").take(1);
    if (existingPrograms.length > 0) {
      return "Programs already seeded";
    }

    const programs = [
      {
        title: "Rhodes Scholarship",
        description: "The Rhodes Scholarship is the oldest and most celebrated international fellowship award. It provides full financial support for students to pursue a degree at the University of Oxford.",
        university: "University of Oxford",
        country: "United Kingdom",
        degree: "Master's/DPhil",
        duration: "2-4 years",
        applicationDeadline: "October 1, 2024",
        requirements: [
          "Academic transcript",
          "Personal statement",
          "8 letters of recommendation",
          "CV/Resume",
          "Proof of English proficiency"
        ],
        benefits: [
          "Full tuition coverage",
          "Living stipend",
          "Travel allowance",
          "Health insurance",
          "Access to Rhodes House"
        ],
        eligibility: [
          "Age 18-24 at time of application",
          "Bachelor's degree completed",
          "Strong academic record",
          "Leadership experience",
          "Commitment to service"
        ],
        isActive: true,
        maxApplicants: 100,
        currentApplicants: 0,
      },
      {
        title: "Fulbright Scholarship",
        description: "The Fulbright Program offers research, study and teaching opportunities in over 140 countries to recent graduates, graduate students and young professionals.",
        university: "Various Universities",
        country: "United States",
        degree: "Master's/PhD",
        duration: "1-2 years",
        applicationDeadline: "October 15, 2024",
        requirements: [
          "Academic transcripts",
          "Statement of purpose",
          "3 letters of recommendation",
          "Language proficiency test",
          "Research proposal"
        ],
        benefits: [
          "Full tuition funding",
          "Monthly living allowance",
          "Round-trip airfare",
          "Health insurance",
          "Professional development"
        ],
        eligibility: [
          "Bachelor's degree required",
          "Strong academic performance",
          "English proficiency",
          "Research experience preferred",
          "Cultural exchange commitment"
        ],
        isActive: true,
        maxApplicants: 150,
        currentApplicants: 0,
      },
      {
        title: "Chevening Scholarship",
        description: "Chevening Scholarships are the UK government's global scholarship programme, funded by the Foreign and Commonwealth Office and partner organisations.",
        university: "UK Universities",
        country: "United Kingdom",
        degree: "Master's",
        duration: "1 year",
        applicationDeadline: "November 2, 2024",
        requirements: [
          "University transcripts",
          "Personal statement",
          "2 references",
          "IELTS/TOEFL scores",
          "Unconditional UK university offer"
        ],
        benefits: [
          "Full tuition fees",
          "Monthly stipend",
          "Travel costs",
          "Arrival allowance",
          "Thesis grant"
        ],
        eligibility: [
          "Bachelor's degree",
          "2+ years work experience",
          "English language requirement",
          "Return to home country",
          "Leadership potential"
        ],
        isActive: true,
        maxApplicants: 200,
        currentApplicants: 0,
      },
      {
        title: "DAAD Scholarship",
        description: "The German Academic Exchange Service (DAAD) offers scholarships for international students to study in Germany at leading universities.",
        university: "German Universities",
        country: "Germany",
        degree: "Master's/PhD",
        duration: "1-4 years",
        applicationDeadline: "November 30, 2024",
        requirements: [
          "Academic certificates",
          "Motivation letter",
          "2 letters of recommendation",
          "German/English proficiency",
          "Research proposal (PhD)"
        ],
        benefits: [
          "Monthly scholarship",
          "Travel allowance",
          "Health insurance",
          "Study allowance",
          "Language course support"
        ],
        eligibility: [
          "Relevant bachelor's degree",
          "Above-average grades",
          "Language proficiency",
          "Motivation for Germany",
          "Clear study/research plan"
        ],
        isActive: true,
        maxApplicants: 120,
        currentApplicants: 0,
      },
      {
        title: "Australia Awards Scholarship",
        description: "Australia Awards Scholarships are long-term development awards administered by the Department of Foreign Affairs and Trade.",
        university: "Australian Universities",
        country: "Australia",
        degree: "Master's/PhD",
        duration: "2-4 years",
        applicationDeadline: "April 30, 2024",
        requirements: [
          "Academic transcripts",
          "Statement of purpose",
          "2 references",
          "English proficiency test",
          "Health examination"
        ],
        benefits: [
          "Full tuition fees",
          "Return air travel",
          "Establishment allowance",
          "Living allowance",
          "Health cover"
        ],
        eligibility: [
          "Minimum bachelor's degree",
          "English language proficiency",
          "Meet health requirements",
          "Return home commitment",
          "Development focus"
        ],
        isActive: true,
        maxApplicants: 80,
        currentApplicants: 0,
      },
      {
        title: "Erasmus Mundus Scholarship",
        description: "Erasmus Mundus Joint Master Degrees are prestigious, integrated, international study programmes, jointly delivered by consortia of higher education institutions.",
        university: "European Universities",
        country: "European Union",
        degree: "Master's",
        duration: "2 years",
        applicationDeadline: "January 15, 2024",
        requirements: [
          "Bachelor's degree transcript",
          "Motivation letter",
          "2 academic references",
          "English proficiency",
          "Passport copy"
        ],
        benefits: [
          "Full scholarship coverage",
          "Monthly allowance",
          "Travel and installation costs",
          "Insurance coverage",
          "Mobility between countries"
        ],
        eligibility: [
          "Bachelor's degree in relevant field",
          "English proficiency",
          "Academic excellence",
          "Motivation for international study",
          "EU/non-EU students eligible"
        ],
        isActive: true,
        maxApplicants: 90,
        currentApplicants: 0,
      }
    ];

    for (const program of programs) {
      await ctx.db.insert("programs", program);
    }

    return `Seeded ${programs.length} programs successfully`;
  },
});

export const seedBlogs = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if blogs already exist
    const existingBlogs = await ctx.db.query("blogs").take(1);
    if (existingBlogs.length > 0) {
      return "Blogs already seeded";
    }

    // Get any user to be the author (preferably admin, but any user will do)
    let authorProfile = await ctx.db.query("userProfiles")
      .withIndex("by_admin", (q) => q.eq("isAdmin", true))
      .first();
    
    if (!authorProfile) {
      authorProfile = await ctx.db.query("userProfiles").first();
    }
    
    if (!authorProfile) {
      return "No user found to create blog posts";
    }

    const blogs = [
      {
        title: "How to Write a Winning Fellowship Application",
        content: `Writing a successful fellowship application requires careful planning, attention to detail, and a clear understanding of what selection committees are looking for. Here are some key strategies to help you craft a compelling application.

First, thoroughly research the fellowship program. Understand its mission, values, and what they're looking for in candidates. Tailor your application to align with these priorities.

Your personal statement is crucial. Tell a compelling story about your background, experiences, and goals. Be specific about how the fellowship will help you achieve your objectives and how you'll contribute to the program.

Letters of recommendation matter immensely. Choose recommenders who know you well and can speak to your qualifications. Give them plenty of time and provide them with your application materials.

Finally, pay attention to the details. Follow all instructions carefully, meet deadlines, and proofread everything multiple times. A polished application demonstrates your professionalism and attention to detail.`,
        excerpt: "Learn the essential strategies for crafting a compelling fellowship application that stands out to selection committees.",
        authorId: authorProfile.userId,
        tags: ["fellowship", "application-tips", "writing", "advice"],
        isPublished: true,
        publishedAt: Date.now() - 7 * 24 * 60 * 60 * 1000, // 7 days ago
      },
      {
        title: "Top 10 Fellowship Programs for International Students",
        content: `International students have access to numerous prestigious fellowship opportunities around the world. Here are ten of the most sought-after programs that offer exceptional funding and academic experiences.

1. Rhodes Scholarship (Oxford University) - The most prestigious international scholarship, offering full funding for study at Oxford.

2. Fulbright Program - Provides opportunities for study, research, and teaching in over 140 countries.

3. Chevening Scholarships - UK government scholarships for outstanding students from around the world.

4. DAAD Scholarships - German Academic Exchange Service offers various programs for study in Germany.

5. Australia Awards - Long-term development scholarships for students from developing countries.

6. Erasmus Mundus - Joint master's degrees offered by consortiums of European universities.

7. Commonwealth Scholarships - For students from Commonwealth countries to study in the UK.

8. Gates Cambridge Scholarship - Full-cost scholarships for outstanding students at Cambridge University.

9. Knight-Hennessy Scholars - Stanford University's flagship fellowship program.

10. Schwarzman Scholars - One-year master's program at Tsinghua University in Beijing.

Each program has unique requirements and benefits, so research thoroughly to find the best fit for your goals.`,
        excerpt: "Discover the most prestigious fellowship programs available to international students worldwide.",
        authorId: authorProfile.userId,
        tags: ["fellowship", "international-students", "scholarships", "education"],
        isPublished: true,
        publishedAt: Date.now() - 14 * 24 * 60 * 60 * 1000, // 14 days ago
      },
      {
        title: "Life as a Rhodes Scholar: An Inside Look",
        content: `Being a Rhodes Scholar is more than just receiving funding for graduate study at Oxford University. It's joining a community of leaders, innovators, and changemakers from around the world.

The Rhodes experience begins with the selection process itself, which is rigorous and competitive. Successful candidates demonstrate not only academic excellence but also leadership potential and a commitment to service.

Once at Oxford, Rhodes Scholars have access to unparalleled academic resources and opportunities. The tutorial system allows for intensive, personalized learning, while the collegiate system provides a strong sense of community.

Beyond academics, Rhodes Scholars participate in various programs and events designed to foster leadership development and global understanding. The Rhodes House serves as a hub for scholars to connect, collaborate, and engage with visiting speakers and dignitaries.

The network of Rhodes Scholars is truly global and lifelong. Alumni include presidents, prime ministers, Nobel laureates, and leaders in every field imaginable. This network provides ongoing opportunities for collaboration and mentorship.

Perhaps most importantly, Rhodes Scholars are expected to use their education and experiences to make a positive impact in the world. The scholarship is not just an honor but a responsibility to serve others and contribute to the greater good.`,
        excerpt: "Get an insider's perspective on what it's really like to be a Rhodes Scholar at Oxford University.",
        authorId: authorProfile.userId,
        tags: ["rhodes-scholarship", "oxford", "student-life", "experience"],
        isPublished: true,
        publishedAt: Date.now() - 21 * 24 * 60 * 60 * 1000, // 21 days ago
      },
      {
        title: "Preparing for Fellowship Interviews: Do's and Don'ts",
        content: `The interview stage is often the final and most crucial step in the fellowship selection process. Here's how to prepare effectively and make a strong impression.

DO: Research the interview panel and format. Know who will be interviewing you and what to expect. Practice common questions but don't over-rehearse to the point of sounding robotic.

DO: Prepare specific examples that demonstrate your qualifications, leadership experience, and commitment to your field. Use the STAR method (Situation, Task, Action, Result) to structure your responses.

DO: Dress professionally and arrive early. First impressions matter, and punctuality shows respect for the interviewers' time.

DO: Ask thoughtful questions about the program. This shows genuine interest and helps you determine if the fellowship is right for you.

DON'T: Memorize answers word-for-word. Authenticity is key, and you want to have natural conversations with the panel.

DON'T: Speak negatively about other programs or institutions. Focus on why this particular fellowship appeals to you.

DON'T: Forget to follow up with a thank-you note. A brief, professional email expressing gratitude for the opportunity can leave a positive final impression.

Remember, the interview is also your chance to evaluate the program. Come prepared with questions that will help you make an informed decision if selected.`,
        excerpt: "Master the fellowship interview process with these essential tips and strategies for success.",
        authorId: authorProfile.userId,
        tags: ["interviews", "fellowship", "preparation", "tips"],
        isPublished: true,
        publishedAt: Date.now() - 28 * 24 * 60 * 60 * 1000, // 28 days ago
      }
    ];

    for (const blog of blogs) {
      await ctx.db.insert("blogs", blog);
    }

    return `Seeded ${blogs.length} blog posts successfully`;
  },
});
