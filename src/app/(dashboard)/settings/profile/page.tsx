"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { profileSchema, type ProfileFormData } from "@/lib/validations";
import { useAuthStore } from "@/stores/auth.store";
import { Button } from "@/components/ui/button";
import { Input, Textarea, FormField } from "@/components/ui/input";
import { Avatar, Card, CardContent, CardHeader } from "@/components/ui/index";
import type { Metadata } from "next";

export default function ProfileSettingsPage() {
  const user = useAuthStore((s) => s.user);
  const [saved, setSaved] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name ?? "",
      email: user?.email ?? "",
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    await new Promise((r) => setTimeout(r, 600));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Avatar section */}
      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold text-slate-900">Profile Picture</h2>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Avatar src={user?.avatar} name={user?.name ?? "U"} size="lg" />
            <div>
              <Button variant="outline" size="sm">Upload photo</Button>
              <p className="text-xs text-slate-400 mt-1">JPG, PNG or GIF. Max 2MB.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile form */}
      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold text-slate-900">Personal Information</h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Full name" required error={errors.name?.message} htmlFor="name">
                <Input id="name" {...register("name")} />
              </FormField>
              <FormField label="Email address" required error={errors.email?.message} htmlFor="email">
                <Input id="email" type="email" {...register("email")} />
              </FormField>
            </div>

            <FormField label="Bio" error={errors.bio?.message} htmlFor="bio">
              <Textarea id="bio" placeholder="Tell your team a bit about yourself..." rows={3} {...register("bio")} />
            </FormField>

            <div className="flex items-center justify-between pt-2">
              {saved && (
                <span className="flex items-center gap-1.5 text-sm text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" />
                  Changes saved
                </span>
              )}
              <Button type="submit" loading={isSubmitting} className="ml-auto">
                Save changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="border-red-200">
        <CardHeader>
          <h2 className="text-sm font-semibold text-red-600">Danger Zone</h2>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-900">Delete account</p>
              <p className="text-xs text-slate-500 mt-0.5">Permanently delete your account and all data.</p>
            </div>
            <Button variant="destructive" size="sm">Delete account</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
