"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterFormData } from "@/lib/validations";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/stores/auth.store";
import { Button } from "@/components/ui/button";
import { Input, FormField } from "@/components/ui/input";

export default function RegisterPage() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setServerError("");
    try {
      const res = await authApi.register(data);
      setUser(res.data);
      router.push("/dashboard");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Registration failed";
      setServerError(message);
    }
  };

  return (
    <>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">Create your account</h1>
        <p className="text-sm text-slate-500 mt-1">Start managing projects in minutes</p>
      </div>

      {serverError && (
        <div className="mb-4 px-3 py-2.5 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <FormField label="Full name" required error={errors.name?.message} htmlFor="name">
          <Input id="name" placeholder="Alex Johnson" autoComplete="name" {...register("name")} />
        </FormField>

        <FormField label="Work email" required error={errors.email?.message} htmlFor="email">
          <Input id="email" type="email" placeholder="you@company.com" autoComplete="email" {...register("email")} />
        </FormField>

        <FormField label="Workspace name" required error={errors.workspaceName?.message} htmlFor="workspaceName">
          <Input id="workspaceName" placeholder="Acme Corp" {...register("workspaceName")} />
        </FormField>

        <FormField label="Password" required error={errors.password?.message} htmlFor="password">
          <Input id="password" type="password" placeholder="8+ characters" autoComplete="new-password" {...register("password")} />
        </FormField>

        <FormField label="Confirm password" required error={errors.confirmPassword?.message} htmlFor="confirmPassword">
          <Input id="confirmPassword" type="password" placeholder="••••••••" autoComplete="new-password" {...register("confirmPassword")} />
        </FormField>

        <Button type="submit" className="w-full mt-2" loading={isSubmitting}>
          Create account
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link href="/login" className="text-indigo-600 font-medium hover:underline">
          Sign in
        </Link>
      </div>
    </>
  );
}
