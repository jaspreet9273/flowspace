import { mockUsers } from "@/lib/mock-data";
import { Header, PageContainer } from "@/components/layout/header";
import { Card, Avatar, Badge } from "@/components/ui/index";
import { formatRelativeTime } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Members" };

const ROLE_COLORS: Record<string, "default" | "info" | "success" | "warning" | "danger"> = {
  owner: "danger",
  admin: "warning",
  member: "info",
  viewer: "default",
};

export default function MembersPage() {
  return (
    <>
      <Header title="Members" description={`${mockUsers.length} workspace members`} />
      <PageContainer>
        <div className="max-w-3xl mx-auto">
          <Card>
            <div className="divide-y divide-slate-100">
              {mockUsers.map((user) => (
                <div key={user.id} className="flex items-center gap-4 px-5 py-4">
                  <Avatar src={user.avatar} name={user.name} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="hidden sm:block text-xs text-slate-400">
                      Active {formatRelativeTime(user.lastActiveAt)}
                    </p>
                    <Badge variant={ROLE_COLORS[user.role]} className="capitalize">
                      {user.role}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </PageContainer>
    </>
  );
}
