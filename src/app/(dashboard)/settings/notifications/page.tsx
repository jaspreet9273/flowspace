"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/index";
import { Switch } from "@/components/ui/forms";
import { Button } from "@/components/ui/button";

interface NotifPrefs {
  taskAssigned: boolean;
  taskCommented: boolean;
  taskStatusChanged: boolean;
  projectInvite: boolean;
  mention: boolean;
  weeklyDigest: boolean;
  emailNotifs: boolean;
}

export default function NotificationSettingsPage() {
  const [prefs, setPrefs] = useState<NotifPrefs>({
    taskAssigned: true,
    taskCommented: true,
    taskStatusChanged: false,
    projectInvite: true,
    mention: true,
    weeklyDigest: true,
    emailNotifs: false,
  });
  const [saved, setSaved] = useState(false);

  const toggle = (key: keyof NotifPrefs) => {
    setPrefs((p) => ({ ...p, [key]: !p[key] }));
  };

  const handleSave = async () => {
    await new Promise((r) => setTimeout(r, 400));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const NOTIFICATION_SETTINGS = [
    { key: "taskAssigned" as const, label: "Task assigned to me", description: "When a task is assigned to you" },
    { key: "taskCommented" as const, label: "Comments on my tasks", description: "When someone comments on tasks you're assigned to" },
    { key: "taskStatusChanged" as const, label: "Status changes", description: "When task status changes on your tasks" },
    { key: "projectInvite" as const, label: "Project invitations", description: "When you're invited to a project" },
    { key: "mention" as const, label: "Mentions", description: "When someone @mentions you" },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold text-slate-900">In-app Notifications</h2>
          <p className="text-xs text-slate-500 mt-0.5">Choose what you get notified about inside Flowspace.</p>
        </CardHeader>
        <CardContent className="space-y-5">
          {NOTIFICATION_SETTINGS.map(({ key, label, description }) => (
            <Switch
              key={key}
              checked={prefs[key]}
              onChange={() => toggle(key)}
              label={label}
              description={description}
            />
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold text-slate-900">Email Notifications</h2>
        </CardHeader>
        <CardContent className="space-y-5">
          <Switch
            checked={prefs.emailNotifs}
            onChange={() => toggle("emailNotifs")}
            label="Enable email notifications"
            description="Receive notifications via email in addition to in-app"
          />
          <Switch
            checked={prefs.weeklyDigest}
            onChange={() => toggle("weeklyDigest")}
            label="Weekly digest"
            description="A weekly summary of activity in your workspace"
            disabled={!prefs.emailNotifs}
          />
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        {saved && <p className="text-sm text-emerald-600">Preferences saved!</p>}
        <Button onClick={handleSave} className="ml-auto">Save preferences</Button>
      </div>
    </div>
  );
}
