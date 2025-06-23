"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useState, useCallback } from "react";
import { toast } from "sonner";

export function SignInForm() {
  const { signIn } = useAuthActions();

  /* Which top-level auth method is shown? */
  const [method, setMethod] = useState<"password" | "otp">("password");

  /* Password flow sub-state ------------------------------------------------ */
  const [passwordFlow, setPasswordFlow] = useState<"signIn" | "signUp">(
    "signIn",
  );

  /* OTP flow sub-state ----------------------------------------------------- */
  const [otpStep, setOtpStep] = useState<"enterEmail" | { email: string }>(
    "enterEmail",
  );

  const [submitting, setSubmitting] = useState(false);
  const stopSubmitting = useCallback(() => setSubmitting(false), []);

  /* -----------------------------------------------------------------------
   *  RENDER PASSWORD (sign-in / sign-up) FORM
   * --------------------------------------------------------------------- */
  const renderPasswordForm = () => (
    <form
      className="flex flex-col gap-form-field"
      onSubmit={(e) => {
        e.preventDefault();
        setSubmitting(true);

        const formData = new FormData(e.currentTarget);
        formData.set("flow", passwordFlow);

        void signIn("password", formData).catch((error) => {
          let msg = "";
          if (error.message.includes("Invalid password")) {
            msg = "Invalid password. Please try again.";
          } else {
            msg =
              passwordFlow === "signIn"
                ? "Could not sign in, did you mean to sign up?"
                : "Could not sign up, did you mean to sign in?";
          }
          toast.error(msg);
          stopSubmitting();
        });
      }}
    >
      <input
        className="auth-input-field"
        name="email"
        placeholder="Email"
        type="email"
        required
      />
      <input
        className="auth-input-field"
        name="password"
        placeholder="Password"
        type="password"
        required
      />

      <button className="auth-button" type="submit" disabled={submitting}>
        {passwordFlow === "signIn" ? "Sign in" : "Sign up"}
      </button>

      <div className="text-center text-sm text-secondary">
        <span>
          {passwordFlow === "signIn"
            ? "Don't have an account? "
            : "Already have an account? "}
        </span>
        <button
          type="button"
          className="text-primary hover:text-primary-hover hover:underline font-medium cursor-pointer"
          onClick={() =>
            setPasswordFlow(passwordFlow === "signIn" ? "signUp" : "signIn")
          }
        >
          {passwordFlow === "signIn" ? "Sign up instead" : "Sign in instead"}
        </button>
      </div>
    </form>
  );

  /* -----------------------------------------------------------------------
 *  RENDER RESEND-OTP FORM
 * --------------------------------------------------------------------- */
const renderOtpForm = (
  <form
    className="flex flex-col gap-form-field"
    onSubmit={(e) => {
      e.preventDefault();
      setSubmitting(true);

      const formData = new FormData(e.currentTarget);
      void signIn("resend-otp", formData)
        .then(() =>
          // step ➊ ‑-> step ➋
          otpStep === "enterEmail" &&
          setOtpStep({ email: formData.get("email") as string }),
        )
        .catch((err) =>
          toast.error(
            err.message ??
              (otpStep === "enterEmail"
                ? "Unable to send code"
                : "Unable to sign in"),
          ),
        )
        .finally(stopSubmitting);
    }}
  >
    {otpStep === "enterEmail" ? (
      /* ➊ FIRST STEP: ask for e-mail */
      <input
        key="email"                       /* re-mounts when we swap fields   */
        className="auth-input-field"
        name="email"
        placeholder="Email"
        type="email"
        required
      />
    ) : (
      /* ➋ SECOND STEP: ask for OTP, keep e-mail hidden */
      <>
        <input
          key="code"                      /* ensures the field starts empty  */
          className="auth-input-field"
          name="code"
          placeholder="Code"
          type="text"
          required
        />
        <input name="email" value={otpStep.email} type="hidden" />
      </>
    )}

    <button className="auth-button" type="submit" disabled={submitting}>
      {otpStep === "enterEmail" ? "Send code" : "Continue"}
    </button>

    {/* Show cancel button only in the second step */}
    {otpStep !== "enterEmail" && (
      <button
        className="text-secondary text-sm mt-2"
        type="button"
        onClick={() => setOtpStep("enterEmail")}
      >
        Cancel
      </button>
    )}
  </form>
);


  /* -----------------------------------------------------------------------
   *  MAIN RENDER
   * --------------------------------------------------------------------- */
  return (
    <div className="w-full">
      {/* Toggle between auth methods -------------------------------------- */}
      <div className="mb-6 flex justify-center gap-4">
        <button
          type="button"
          className={`auth-tab ${method === "password" ? "auth-tab-active" : ""}`}
          onClick={() => setMethod("password")}
        >
          Password
        </button>
        <button
          type="button"
          className={`auth-tab ${method === "otp" ? "auth-tab-active" : ""}`}
          onClick={() => setMethod("otp")}
        >
          Email code
        </button>
      </div>

      {method === "password" ? renderPasswordForm() : renderOtpForm}

      {/* Google sign-in delimiter ---------------------------------------- */}
      <div className="flex items-center justify-center my-3">
        <hr className="my-4 grow border-gray-200" />
        <span className="mx-4 text-secondary">or</span>
        <hr className="my-4 grow border-gray-200" />
      </div>

      {/* Google OAuth ----------------------------------------------------- */}
      <button
        className="auth-button"
        onClick={() => void signIn("google")}
        disabled={submitting}
      >
        Sign in with Google
      </button>
    </div>
  );
}
