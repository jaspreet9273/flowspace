"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { workspaceSchema, type WorkspaceFormData } from "@/lib/validations";
import { useAuthStore } from "@/stores/auth.store";
import { Button } from "@/components/ui/button";
import { Input, FormField } from "@/components/ui/input";
import { Card, CardContent, CardHeader, Badge } from "@/components/ui/index";

export default function WorkspaceSettingsPage() {
  const user = useAuthStore((s) => s.user);
  const [saved, setSaved] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<WorkspaceFormData>({
    resolver: zodResolver(workspaceSchema),
    defaultValues: {
      name: user?.workspace.name ?? "",
      slug: user?.workspace.slug ?? "",
    },
  });

  const onSubmit = async () => {
    await new Promise((r) => setTimeout(r, 600));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const plan = user?.workspace.plan ?? "free";

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold text-slate-900">Workspace Settings</h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField label="Workspace name" required error={errors.name?.message} htmlFor="wname">
              <Input id="wname" {...register("name")} />
            </FormField>

            <FormField label="URL slug" required error={errors.slug?.message} htmlFor="wslug">
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-slate-200 bg-slate-50 text-slate-500 text-sm">
                  flowspace.app/
                </span>
                <Input id="wslug" className="rounded-l-none" {...register("slug")} />
              </div>
            </FormField>

            <div className="flex items-center justify-between pt-2">
              {saved && (
                <span className="flex items-center gap-1.5 text-sm text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" />
                  Saved
                </span>
              )}
              <Button type="submit" loading={isSubmitting} className="ml-auto">
                Save changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Plan */}
      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold text-slate-900">Plan & Billing</h2>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-slate-900 capitalize">{plan} Plan</p>
                <Badge variant={plan === "pro" ? "info" : plan === "enterprise" ? "success" : "default"} className="capitalize">
                  {plan}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {plan === "free" ? "Up to 5 members, 10 projects." : "Unlimited members and projects."}
              </p>
            </div>
            {plan === "free" && (
              <Button size="sm" variant="outline">Upgrade to Pro</Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
