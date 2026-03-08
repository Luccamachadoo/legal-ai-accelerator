import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { User, Phone, FileText, Save, Loader2, Camera, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { profileSchema } from "@/lib/validations";

export default function Perfil() {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [oab, setOab] = useState("");
  const [whatsappPhone, setWhatsappPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setFullName(data.full_name ?? "");
          setOab(data.oab ?? "");
          setWhatsappPhone(data.whatsapp_phone ?? "");
          setAvatarUrl(data.avatar_url ?? "");
        }
        setLoading(false);
      });
  }, [user]);

  const uploadAvatar = async (file: File) => {
    if (!user) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Selecione um arquivo de imagem");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 2MB");
      return;
    }

    setUploading(true);
    const ext = file.name.split(".").pop();
    const filePath = `${user.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      toast.error("Erro ao enviar imagem");
      setUploading(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    const newUrl = `${publicUrlData.publicUrl}?t=${Date.now()}`;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: newUrl })
      .eq("user_id", user.id);

    if (updateError) {
      toast.error("Erro ao atualizar perfil");
    } else {
      setAvatarUrl(newUrl);
      toast.success("Foto atualizada!");
    }
    setUploading(false);
  };

  const removeAvatar = async () => {
    if (!user) return;
    setUploading(true);

    // List files in user folder and delete them
    const { data: files } = await supabase.storage
      .from("avatars")
      .list(user.id);

    if (files && files.length > 0) {
      await supabase.storage
        .from("avatars")
        .remove(files.map((f) => `${user.id}/${f.name}`));
    }

    await supabase
      .from("profiles")
      .update({ avatar_url: null })
      .eq("user_id", user.id);

    setAvatarUrl("");
    toast.success("Foto removida");
    setUploading(false);
  };

  const handleSave = async () => {
    if (!user) return;

    const result = profileSchema.safeParse({ fullName, oab, whatsappPhone });
    if (!result.success) {
      const firstError = result.error.issues[0]?.message;
      toast.error(firstError || "Dados inválidos");
      return;
    }

    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: result.data.fullName,
        oab: result.data.oab || null,
        whatsapp_phone: result.data.whatsappPhone || null,
      })
      .eq("user_id", user.id);

    if (error) {
      toast.error("Erro ao salvar perfil");
    } else {
      toast.success("Perfil atualizado com sucesso!");
    }
    setSaving(false);
  };

  const initials = fullName
    ? fullName
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? "?";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-display text-foreground">Meu Perfil</h1>
        <p className="text-muted-foreground mt-1">Gerencie suas informações pessoais e profissionais</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Avatar Card */}
        <Card className="md:col-span-1">
          <CardContent className="flex flex-col items-center pt-8 pb-6 gap-4">
            <div className="relative group">
              <Avatar className="h-24 w-24 text-2xl">
                <AvatarImage src={avatarUrl} />
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute inset-0 flex items-center justify-center rounded-full bg-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                {uploading ? (
                  <Loader2 className="h-6 w-6 text-background animate-spin" />
                ) : (
                  <Camera className="h-6 w-6 text-background" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadAvatar(file);
                  e.target.value = "";
                }}
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                <Camera className="h-3.5 w-3.5 mr-1.5" />
                {avatarUrl ? "Trocar foto" : "Enviar foto"}
              </Button>
              {avatarUrl && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={removeAvatar}
                  disabled={uploading}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                  Remover
                </Button>
              )}
            </div>

            <div className="text-center">
              <p className="font-semibold text-lg text-foreground">{fullName || "Sem nome"}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
            {oab && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                <FileText className="h-3.5 w-3.5" />
                OAB {oab}
              </span>
            )}
            <p className="text-xs text-muted-foreground text-center">JPG, PNG ou WebP • Máx. 2MB</p>
          </CardContent>
        </Card>

        {/* Form Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Informações Pessoais
            </CardTitle>
            <CardDescription>Atualize seus dados de contato e registro profissional</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nome completo</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="fullName"
                  placeholder="Dr. João Silva"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="oab">Número da OAB</Label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="oab"
                  placeholder="SP 123456"
                  value={oab}
                  onChange={(e) => setOab(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp">Telefone WhatsApp</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="whatsapp"
                  placeholder="(11) 99999-9999"
                  value={whatsappPhone}
                  onChange={(e) => setWhatsappPhone(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={user?.email ?? ""} disabled className="bg-muted" />
              <p className="text-xs text-muted-foreground">O email não pode ser alterado</p>
            </div>

            <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto">
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Salvar alterações
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
