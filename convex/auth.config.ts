export default {
  providers: [
    {
      domain: process.env.CONVEX_SITE_URL,
      applicationID: "convex",
    },
  ],
};
// auth.config.ts
console.log("AUTH_RESEND_KEY at runtime:", process.env.AUTH_RESEND_KEY);
