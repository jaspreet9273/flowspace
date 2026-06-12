"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { createProjectSchema, type CreateProjectFormData } from "@/lib/validations";
import { useCreateProject } from "@/hooks/queries";
import { Button } from "@/components/ui/button";
import { Input, Textarea, FormField } from "@/components/ui/input";
import { Header, PageContainer } from "@/components/layout/header";
import { Card, CardContent, CardHeader } from "@/components/ui/index";
import { PROJECT_COLORS, cn } from "@/lib/utils";

export default function NewProjectPage() {
  const router = useRouter();
  const { mutate: createProject, isPending } = useCreateProject();
  const [selectedColor, setSelectedColor] = useState(PROJECT_COLORS[0]);

  const { register, handleSubmit, formState: { errors } } = useForm<CreateProjectFormData>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: { color: PROJECT_COLORS[0] },
  });

  const onSubmit = (data: CreateProjectFormData) => {
    createProject(
      { ...data, color: selectedColor },
      { onSuccess: (res) => router.push(`/projects/${res.data.id}`) }
    );
  };

  return (
    <>
      <Header
        title="New Project"
        actions={
          <Link href="/projects" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
            <ArrowLeft className="h-4 w-4" />
            Projects
          </Link>
        }
      />
      <PageContainer>
        <div className="max-w-xl mx-auto">
          <Card>
            <CardHeader>
              <h2 className="text-sm font-semibold text-slate-900">Project details</h2>
              <p className="text-xs text-slate-500 mt-0.5">Fill in the details to create your project.</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <FormField label="Project name" required error={errors.name?.message} htmlFor="name">
                  <Input
                    id="name"
                    placeholder="e.g. Website Redesign"
                    autoFocus
                    {...register("name")}
                  />
                </FormField>

                <FormField label="Description" error={errors.description?.message} htmlFor="desc">
                  <Textarea
                    id="desc"
                    placeholder="What is this project about? What are the goals?"
                    rows={4}
                    {...register("description")}
                  />
                </FormField>

                <div>
                  <p className="text-sm font-medium text-slate-700 mb-2">Project color</p>
                  <div className="flex flex-wrap gap-2.5">
                    {PROJECT_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setSelectedColor(color)}
                        style={{ backgroundColor: color }}
                        className={cn(
                          "h-8 w-8 rounded-full transition-all hover:scale-110 focus:outline-none",
                          selectedColor === color
                            ? "ring-2 ring-offset-2 ring-slate-500 scale-110"
                            : ""
                        )}
                        aria-label={`Color ${color}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Preview */}
                <div className="flex items-center gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="h-4 w-4 rounded-full shrink-0" style={{ backgroundColor: selectedColor }} />
                  <span className="text-sm text-slate-600">Project color preview</span>
                </div>

                <FormField label="Due date" error={errors.dueDate?.message} htmlFor="dueDate">
                  <Input id="dueDate" type="date" {...register("dueDate")} />
                </FormField>

                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => router.back()}>
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1" loading={isPending}>
                    Create Project
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    </>
  );
}
