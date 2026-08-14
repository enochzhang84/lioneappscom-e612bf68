import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/error")({
  ssr: false,
  head: () => ({ meta: [{ title: "链接已失效 — LioneApps 密码中心" }] }),
  validateSearch: (search: Record<string, unknown>) => ({
    return: typeof search.return === "string" ? search.return : undefined,
  }),
  component: ErrorPage,
});

function ErrorPage() {
  const { return: returnUrl } = useSearch({ from: "/error" });

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <Card className="w-full max-w-md rounded-2xl shadow-xl">
        <CardContent className="space-y-6 py-10 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600 text-3xl">
            !
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold">链接已失效</h1>
            <p className="text-sm text-muted-foreground">
              可能原因：链接已过期、已被使用，或 Token 无效。
            </p>
          </div>
          <Button asChild className="w-full">
            <Link
              to="/forgot-password"
              search={{ return: returnUrl || undefined }}
            >
              重新发送密码重置邮件
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
