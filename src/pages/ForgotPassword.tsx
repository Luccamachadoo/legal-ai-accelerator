import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Bot, Mail, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { forgotPasswordSchema } from "@/lib/validations";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = forgotPasswordSchema.safeParse({ email });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0] as string] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(result.data.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      toast.error(error.message);
    } else {
      setSent(true);
      toast.success("Email enviado! Verifique sua caixa de entrada.");
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl holly-gradient mb-4">
            <Bot className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-display font-bold tracking-tight">Recuperar senha</h1>
        </div>

        <Card className="holly-card-shadow border-border/50">
          <CardContent className="pt-6 space-y-4">
            {sent ? (
              <div className="text-center space-y-3 py-4">
                <Mail className="h-12 w-12 text-primary mx-auto" />
                <p className="text-sm text-muted-foreground">
                  Enviamos um link de recuperação para <strong>{email}</strong>.
                  Verifique sua caixa de entrada.
                </p>
                <Link to="/login">
                  <Button variant="outline" className="mt-4">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Voltar ao login
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <p className="text-sm text-muted-foreground text-center">
                  Insira seu email e enviaremos um link para redefinir sua senha.
                </p>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      className="pl-9"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                </div>
                <Button
                  type="submit"
                  className="w-full holly-gradient border-0 text-primary-foreground hover:opacity-90"
                  disabled={loading}
                >
                  {loading ? "Enviando..." : "Enviar link"}
                </Button>
                <p className="text-center text-sm">
                  <Link to="/login" className="text-primary hover:underline">
                    <ArrowLeft className="inline h-3 w-3 mr-1" />
                    Voltar ao login
                  </Link>
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
