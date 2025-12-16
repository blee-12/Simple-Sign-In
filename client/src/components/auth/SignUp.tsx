import { useState } from "react";
import {
  validateCode,
  validateEmail,
  validateFirstName,
  validateLastName,
  validatePassword,
} from "../../../../common/validation";
import { useLoginState, validationWrapper } from "../../lib/helper";
import { WEBSITE_URL } from "../../lib/assets";
import { useNavigate } from "react-router";
import { SolidCard } from "./SolidCard";

export function SignUp() {
  const navigate = useNavigate();
  const setLoginState = useLoginState();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    code: "",
  });

  const [errors, setErrors] = useState<string[]>([]);
  const [step, setStep] = useState<"email" | "verify" | "complete">("email");
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newErrors: string[] = [];
    const email = validationWrapper(validateEmail, formData.email, newErrors);
    setErrors(newErrors);

    if (newErrors.length === 0) {
      try {
        setLoading(true);
        const res = await fetch(`${WEBSITE_URL}/verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        setLoading(false);

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Verification failed!");
        }

        setStep("verify");
      } catch (err: unknown) {
        setLoading(false);
        setErrors([(err as Error).message]);
      }
    }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    const newErrors: string[] = [];

    const first_name = validationWrapper(
      validateFirstName,
      formData.firstName,
      newErrors
    );
    const last_name = validationWrapper(
      validateLastName,
      formData.lastName,
      newErrors
    );
    const email = validationWrapper(validateEmail, formData.email, newErrors);
    const password = validationWrapper(
      validatePassword,
      formData.password,
      newErrors
    );

    if (formData.password !== formData.confirmPassword) {
      newErrors.push("Passwords must match!");
    }
    if (!formData.code || formData.code.length !== 6) {
      newErrors.push("Verification code must be 6 digits!");
    }

    try {
      validateCode(formData.code.trim(), 6);
    } catch (err) {
      newErrors.push(err instanceof Error ? err.message : "Invalid Code");
    }

    setErrors(newErrors);

    if (newErrors.length === 0) {
      try {
        setLoading(true);
        const res = await fetch(`${WEBSITE_URL}/signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            first_name,
            last_name,
            email,
            password,
            code: formData.code.trim(),
          }),
          credentials: "include",
        });
        setLoading(false);

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Signup failed!");
        }

        const data = await res.json();
        console.log("Signup complete:", data);
        setLoginState("FullUser");
        navigate("/dashboard");
      } catch (err: unknown) {
        setLoading(false);
        setErrors([(err as Error).message]);
      }
    }
  }

  async function handleResend() {
    try {
      setLoading(true);
      const res = await fetch(`${WEBSITE_URL}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });
      setLoading(false);

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Resend failed!");
      }
    } catch (err: unknown) {
      setLoading(false);
      setErrors([(err as Error).message]);
    }
  }

  return (
    <SolidCard title="Sign Up">
      {step === "email" && (
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-3 border rounded-lg"
          />
          {errors.length > 0 && (
            <div className="text-red-600">{errors.join(", ")}</div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-3 rounded-lg"
          >
            {loading ? "Sending..." : "Verify Email"}
          </button>
        </form>
      )}

      {step === "verify" && (
        <form onSubmit={handleSignUp} className="space-y-4">
          <input
            type="text"
            name="code"
            placeholder="6-digit Code"
            value={formData.code}
            onChange={handleChange}
            className="w-full px-4 py-3 border rounded-lg"
          />
          <button
            type="button"
            onClick={handleResend}
            disabled={loading}
            className="text-blue-500 underline"
          >
            Resend Code
          </button>
          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            value={formData.firstName}
            onChange={handleChange}
            className="w-full px-4 py-3 border rounded-lg"
          />
          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={handleChange}
            className="w-full px-4 py-3 border rounded-lg"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-3 border rounded-lg"
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full px-4 py-3 border rounded-lg"
          />

          {errors.length > 0 && (
            <div className="text-red-600">{errors.join(", ")}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-3 rounded-lg"
          >
            {loading ? "Signing Up..." : "Complete Sign Up"}
          </button>
        </form>
      )}
    </SolidCard>
  );
}
