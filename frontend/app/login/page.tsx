"use client";

import {
  FormEvent,
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  GraduationCap,
  Lock,
  Mail,
  RefreshCw,
  School,
  ShieldCheck,
  User,
} from "lucide-react";

import {
  AuthResponse,
  forgotPassword,
  loginUser,
  resendOtp,
  signupUser,
  verifyOtp,
} from "@/app/services/authService";

import { getApiErrorCode } from "@/app/services/apiService";
import {
  dashboardForRole,
  isSafeRoleReturnTo,
} from "@/app/lib/authRoutes";

import { useAuth } from "@/components/AuthProvider";

type View = "login" | "signup" | "otp" | "forgot" | "success";
type OtpPurpose = "REGISTER" | "LOGIN_2FA";
type PublicRole = "STUDENT" | "PARENT";

export default function LoginPage() {
  const router = useRouter();
  const { establishSession, status, user } = useAuth();

  const [view, setView] = useState<View>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<PublicRole>("STUDENT");

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpPurpose, setOtpPurpose] =
    useState<OtpPurpose>("LOGIN_2FA");

  const [resendSeconds, setResendSeconds] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (status === "authenticated" && user) {
      router.replace(`/${user.role.toLowerCase()}/dashboard`);
    }
  }, [router, status, user]);

  useEffect(() => {
    const mode = new URLSearchParams(window.location.search).get("mode");

    if (mode === "signup") {
      setView("signup");
    }
  }, []);

  useEffect(() => {
    if (resendSeconds <= 0) return;

    const timer = window.setInterval(() => {
      setResendSeconds((seconds) => Math.max(0, seconds - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [resendSeconds]);

  const completeLogin = async (response: AuthResponse) => {
    const authenticatedUser = await establishSession(response);

    const requested = new URLSearchParams(
      window.location.search
    ).get("returnTo");

    router.replace(
      isSafeRoleReturnTo(authenticatedUser.role, requested)
        ? requested
        : dashboardForRole(authenticatedUser.role)
    );
  };

  const submitLogin = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await loginUser({
        email,
        password,
      });

      if (response.message === "OTP_SENT") {
        setOtpPurpose("LOGIN_2FA");
        setView("otp");
        setResendSeconds(30);
      } else {
        await completeLogin(response);
      }
    } catch (unknownError: unknown) {
      if (
        getApiErrorCode(unknownError) === "EMAIL_NOT_VERIFIED" ||
        messageOf(unknownError) === "EMAIL_NOT_VERIFIED"
      ) {
        setOtpPurpose("REGISTER");
        setView("otp");
        setResendSeconds(30);
      } else {
        setError(
          messageOf(unknownError, "Invalid email or password.")
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const submitSignup = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const passwordError = getPasswordValidationError(password);
      if (passwordError) {
        setError(passwordError);
        return;
      }

      const response = await signupUser({
        name,
        email,
        password,
        role,
      });

      if (response.message === "OTP_SENT") {
        setOtpPurpose("REGISTER");
        setView("otp");
        setResendSeconds(30);
      } else {
        setError(
          "Check your email to complete registration."
        );
      }
    } catch (unknownError: unknown) {
      setError(
        messageOf(unknownError, "Registration failed.")
      );
    } finally {
      setLoading(false);
    }
  };

  const submitOtp = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (otp.some((digit) => !digit)) return;

    setLoading(true);
    setError("");

    try {
      const response = await verifyOtp({
        email,
        otp: otp.join(""),
        purpose: otpPurpose,
      });

      await completeLogin(response);
    } catch (unknownError: unknown) {
      setError(
        messageOf(
          unknownError,
          "The verification code is invalid."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    if (resendSeconds) return;

    setError("");

    try {
      await resendOtp({
        email,
        purpose: otpPurpose,
      });

      setOtp(["", "", "", "", "", ""]);
      setResendSeconds(30);

      otpRefs.current[0]?.focus();
    } catch (unknownError: unknown) {
      setError(
        messageOf(
          unknownError,
          "Could not resend the code."
        )
      );
    }
  };

  const submitForgot = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      await forgotPassword(email);
      setView("success");
    } catch (unknownError: unknown) {
      setError(
        messageOf(
          unknownError,
          "Could not submit the password reset request."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const changeOtp = (
    index: number,
    input: string
  ) => {
    const digit = input
      .replace(/\D/g, "")
      .slice(-1);

    setOtp((current) =>
      current.map((value, position) =>
        position === index ? digit : value
      )
    );

    if (digit && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const otpKeyDown = (
    index: number,
    event: KeyboardEvent<HTMLInputElement>
  ) => {
    if (
      event.key === "Backspace" &&
      !otp[index] &&
      index > 0
    ) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 py-10 dark:bg-slate-950">
      <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-blue-500/15 blur-3xl" />

      <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-purple-500/15 blur-3xl" />

      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 lg:grid-cols-2">

        {/* LEFT PANEL */}
        <section className="hidden bg-gradient-to-br from-blue-700 to-indigo-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
                <School className="h-6 w-6" />
              </span>

              <div>
                <h1 className="text-2xl font-black">
                  CampusCore
                </h1>

                <p className="text-xs uppercase tracking-widest text-blue-200">
                  School Management
                </p>
              </div>
            </div>

            <h2 className="mt-16 text-4xl font-black leading-tight">
              One secure portal for your school community.
            </h2>

            <p className="mt-4 text-blue-100">
              Role-based access for administrators,
              teachers, students, and parents.
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm text-blue-100">
            <ShieldCheck className="h-5 w-5" />
            JWT authentication with email verification
          </div>
        </section>

        {/* RIGHT PANEL */}
        <section className="p-7 sm:p-10">

          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <GraduationCap className="h-7 w-7 text-blue-600" />
            <span className="text-xl font-black">
              CampusCore
            </span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{
                opacity: 0,
                y: 8,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -8,
              }}
            >

              {/* LOGIN */}
              {view === "login" && (
                <>
                  <Title
                    title="Welcome back"
                    subtitle="Sign in with your school account."
                  />

                  <form
                    onSubmit={submitLogin}
                    className="space-y-4"
                  >
                    <EmailField
                      value={email}
                      setValue={setEmail}
                    />

                    <PasswordField
                      value={password}
                      setValue={setPassword}
                      autoComplete="current-password"
                    />

                    {error && (
                      <ErrorMessage message={error} />
                    )}

                    <button
                      disabled={loading}
                      className="primary-button"
                    >
                      {loading ? (
                        <Spinner />
                      ) : (
                        "Continue"
                      )}
                    </button>
                  </form>

                  <div className="mt-5 flex items-center justify-between text-sm">
                    <button
                      type="button"
                      onClick={() => {
                        setView("forgot");
                        setError("");
                      }}
                      className="text-blue-600 hover:underline"
                    >
                      Forgot password?
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setView("signup");
                        setError("");
                      }}
                      className="font-semibold text-blue-600 hover:underline"
                    >
                      Create account
                    </button>
                  </div>
                </>
              )}

              {/* SIGNUP */}
              {view === "signup" && (
                <>
                  <Back
                    onClick={() => {
                      setView("login");
                      setError("");
                    }}
                  />

                  <Title
                    title="Create account"
                    subtitle="Students and parents can self-register. Staff accounts are provisioned by an administrator."
                  />

                  <form
                    onSubmit={submitSignup}
                    className="space-y-4"
                  >
                    <label className="input-shell">
                      <User className="h-4 w-4 text-slate-400" />

                      <input
                        required
                        minLength={2}
                        autoComplete="name"
                        value={name}
                        onChange={(event) =>
                          setName(event.target.value)
                        }
                        placeholder="Full name"
                        className="input-control"
                      />
                    </label>

                    <EmailField
                      value={email}
                      setValue={setEmail}
                    />

                    <PasswordField
                      value={password}
                      setValue={setPassword}
                      autoComplete="new-password"
                    />

                    <label className="block text-sm font-semibold">
                      Account type

                      <select
                        value={role}
                        onChange={(event) =>
                          setRole(
                            event.target.value as PublicRole
                          )
                        }
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800"
                      >
                        <option value="STUDENT">
                          Student
                        </option>

                        <option value="PARENT">
                          Parent
                        </option>
                      </select>
                    </label>

                    {error && (
                      <ErrorMessage message={error} />
                    )}

                    <button
                      disabled={loading}
                      className="primary-button"
                    >
                      {loading ? (
                        <Spinner />
                      ) : (
                        "Register and verify email"
                      )}
                    </button>
                  </form>
                </>
              )}

              {/* OTP */}
              {view === "otp" && (
                <>
                  <Back
                    onClick={() =>
                      setView(
                        otpPurpose === "REGISTER"
                          ? "signup"
                          : "login"
                      )
                    }
                  />

                  <Title
                    title="Verify your email"
                    subtitle={`Enter the six-digit code sent to ${email}.`}
                  />

                  <form onSubmit={submitOtp}>
                    <div className="flex gap-2">
                      {otp.map((digit, index) => (
                        <input
                          key={index}
                          ref={(element) => {
                            otpRefs.current[index] =
                              element;
                          }}
                          aria-label={`Verification digit ${
                            index + 1
                          }`}
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(event) =>
                            changeOtp(
                              index,
                              event.target.value
                            )
                          }
                          onKeyDown={(event) =>
                            otpKeyDown(index, event)
                          }
                          className="h-13 min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 py-3 text-center text-xl font-black outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800"
                        />
                      ))}
                    </div>

                    {error && (
                      <div className="mt-4">
                        <ErrorMessage
                          message={error}
                        />
                      </div>
                    )}

                    <button
                      disabled={
                        loading ||
                        otp.some((digit) => !digit)
                      }
                      className="primary-button mt-6"
                    >
                      {loading ? (
                        <Spinner />
                      ) : (
                        "Verify and continue"
                      )}
                    </button>
                  </form>

                  <button
                    type="button"
                    disabled={resendSeconds > 0}
                    onClick={() => void resend()}
                    className="mt-4 flex w-full items-center justify-center gap-2 text-sm font-semibold text-blue-600 disabled:text-slate-400"
                  >
                    {resendSeconds ? (
                      <>
                        <Clock className="h-4 w-4" />
                        Resend in {resendSeconds}s
                      </>
                    ) : (
                      "Resend code"
                    )}
                  </button>
                </>
              )}

              {/* FORGOT PASSWORD */}
              {view === "forgot" && (
                <>
                  <Back
                    onClick={() => {
                      setView("login");
                      setError("");
                    }}
                  />

                  <Title
                    title="Reset your password"
                    subtitle="If an account exists, the server will email reset instructions."
                  />

                  <form
                    onSubmit={submitForgot}
                    className="space-y-4"
                  >
                    <EmailField
                      value={email}
                      setValue={setEmail}
                    />

                    {error && (
                      <ErrorMessage message={error} />
                    )}

                    <button
                      disabled={loading}
                      className="primary-button"
                    >
                      {loading ? (
                        <Spinner />
                      ) : (
                        "Send reset instructions"
                      )}
                    </button>
                  </form>
                </>
              )}

              {/* SUCCESS */}
              {view === "success" && (
                <div className="py-10 text-center">
                  <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-500" />

                  <Title
                    title="Check your email"
                    subtitle="If the account exists, password-reset instructions have been sent."
                  />

                  <button
                    type="button"
                    onClick={() => {
                      setView("login");
                      setError("");
                    }}
                    className="primary-button mt-6"
                  >
                    Back to sign in
                  </button>
                </div>
              )}

            </motion.div>
          </AnimatePresence>

          <p className="mt-8 text-center text-xs text-slate-400">
            By continuing, you agree to your school&apos;s
            acceptable-use and privacy policies.
          </p>

          <p className="mt-3 text-center text-xs">
            <Link
              href="/"
              className="text-blue-600 hover:underline"
            >
              Return to CampusCore home
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}

/* =========================================================
   TITLE
========================================================= */

function Title({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-black">
        {title}
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        {subtitle}
      </p>
    </div>
  );
}

/* =========================================================
   EMAIL FIELD
========================================================= */

function EmailField({
  value,
  setValue,
}: {
  value: string;
  setValue: (value: string) => void;
}) {
  return (
    <label className="input-shell">
      <Mail className="h-4 w-4 text-slate-400" />

      <input
        required
        type="email"
        autoComplete="email"
        value={value}
        onChange={(event) =>
          setValue(event.target.value)
        }
        placeholder="Email address"
        className="input-control"
      />
    </label>
  );
}

/* =========================================================
   PASSWORD FIELD
   FIXED REGEX
========================================================= */

function isPasswordValid(value: string) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,128}$/.test(value);
}

function getPasswordValidationError(value: string) {
  if (!value) return "Password is required.";
  if (value.length < 8) return "Password must be at least 8 characters long.";
  if (value.length > 128) return "Password must be 128 characters or fewer.";
  if (!/[a-z]/.test(value)) return "Password must include at least one lowercase letter.";
  if (!/[A-Z]/.test(value)) return "Password must include at least one uppercase letter.";
  if (!/\d/.test(value)) return "Password must include at least one number.";
  if (!/[^A-Za-z0-9]/.test(value)) return "Password must include at least one special character.";
  return "";
}

function PasswordField({
  value,
  setValue,
  autoComplete,
}: {
  value: string;
  setValue: (value: string) => void;
  autoComplete: string;
}) {
  const isNewPassword =
    autoComplete === "new-password";

  return (
    <div>
      <label className="input-shell">
        <Lock className="h-4 w-4 text-slate-400" />

        <input
          required
          minLength={isNewPassword ? 8 : 1}
          maxLength={128}
          type="password"
          autoComplete={autoComplete}
          value={value}
          onChange={(event) =>
            setValue(event.target.value)
          }
          placeholder="Password"
          className="input-control"
        />
      </label>

      {isNewPassword && (
        <p className="mt-1 px-1 text-xs text-slate-500">
          Use 8–128 characters with uppercase,
          lowercase, a number, and a special character.
        </p>
      )}
    </div>
  );
}

/* =========================================================
   BACK BUTTON
========================================================= */

function Back({
  onClick,
}: {
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mb-5 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500"
    >
      <ArrowLeft className="h-4 w-4" />
      Back
    </button>
  );
}

/* =========================================================
   ERROR MESSAGE
========================================================= */

function ErrorMessage({
  message,
}: {
  message: string;
}) {
  return (
    <p
      role="alert"
      className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-950/30 dark:text-rose-200"
    >
      {message}
    </p>
  );
}

/* =========================================================
   SPINNER
========================================================= */

function Spinner() {
  return (
    <RefreshCw className="mx-auto h-5 w-5 animate-spin" />
  );
}

/* =========================================================
   ERROR MESSAGE HELPER
========================================================= */

function messageOf(
  error: unknown,
  fallback = "The request failed."
) {
  return error instanceof Error
    ? error.message
    : fallback;
}