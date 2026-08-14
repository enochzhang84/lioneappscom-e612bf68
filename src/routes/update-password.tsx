import { createFileRoute, useNavigate, useSearch, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

export const Route = createFileRoute("/update-password")({
  ssr: false,
  head: () => ({
    meta: [{ title: "重置密码 — LioneApps 密码中心" }],
  }),
  validateSearch: (search: Record<string, unknown>) => ({
    return: typeof search.return === "string" ? search.return : undefined,
  }),
  component: UpdatePasswordPage,
});

function UpdatePasswordPage() {
  const navigate = useNavigate();
  const { return: returnUrl } = useSearch({ from: "/update-password" });
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        if (!cancelled) setReady(true);
      }
    });
    // Fallback: check current session
    supabase.auth.getSession().then(({ data }) => {
      if (!cancelled && data.session) setReady(true);
    });
    // Detect invalid link (no recovery hash/params)
    const t = setTimeout(() => {
      if (cancelled) return;
      supabase.auth.getSession().then(({ data }) => {
        if (!data.session && !cancelled) {
          navigate({ to: "/error", search: { return: returnUrl } });
        }
      });
    }, 1500);
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
      clearTimeout(t);
    };
  }, [navigate, returnUrl]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) return toast.error("密码至少 6 位");
    if (password !== confirm) return toast.error("两次输入的密码不一致");
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("密码已重置成功");
      await supabase.auth.signOut();
      navigate({ to: "/success", search: { return: returnUrl } });
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <Toaster richColors position="top-center" />
      <Card className="w-full max-w-md rounded-2xl shadow-xl">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl">设置新密码</CardTitle>
          <p className="text-sm text-muted-foreground">请输入您的新密码</p>
        </CardHeader>
        <CardContent>
          {!ready ? (
            <p className="text-center text-sm text-muted-foreground py-8">
              正在验证重置链接…
            </p>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">新密码</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">确认密码</Label>
                <Input
                  id="confirm"
                  type="password"
                  required
                  minLength={6}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full" disabled={busy}>
                {busy ? "提交中…" : "重置密码"}
              </Button>
              <div className="text-center text-sm">
                <Link to="/forgot-password" search={{ return: undefined }} className="text-muted-foreground hover:text-foreground">
                  返回找回密码
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
