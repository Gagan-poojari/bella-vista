"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Spinner } from "@/app/components/ui/Spinner";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        toast.error("Invalid email or password");
      } else {
        toast.success("Logged in successfully");
        router.push("/admin");
        router.refresh();
      }
    } catch (error) {
      toast.error("An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-mist px-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-[0_20px_50px_rgba(30,42,29,0.14)]">
        <h1 className="font-display text-3xl font-semibold text-ink text-center mb-6">
          Admin Login
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <label className="block">
            <span className="font-body text-[11px] font-medium uppercase tracking-[0.08em] text-ink/50">
              Email Address
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full border-b border-bark/20 pb-2 font-body text-[14px] text-ink bg-transparent outline-none focus:border-husk"
            />
          </label>

          <label className="block">
            <span className="font-body text-[11px] font-medium uppercase tracking-[0.08em] text-ink/50">
              Password
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full border-b border-bark/20 pb-2 font-body text-[14px] text-ink bg-transparent outline-none focus:border-husk"
            />
          </label>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-ink py-3.5 font-body text-[13.5px] font-semibold text-mist transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_26px_rgba(201,160,92,0.4)] disabled:opacity-70 disabled:hover:translate-y-0"
          >
            {isLoading ? <Spinner className="w-4 h-4" /> : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
