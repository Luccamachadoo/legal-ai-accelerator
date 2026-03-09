export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      agendamentos: {
        Row: {
          advogado_id: string
          contato_id: string
          created_at: string
          data_hora: string
          id: string
          link_reuniao: string | null
          status: string | null
        }
        Insert: {
          advogado_id: string
          contato_id: string
          created_at?: string
          data_hora: string
          id?: string
          link_reuniao?: string | null
          status?: string | null
        }
        Update: {
          advogado_id?: string
          contato_id?: string
          created_at?: string
          data_hora?: string
          id?: string
          link_reuniao?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agendamentos_contato_id_fkey"
            columns: ["contato_id"]
            isOneToOne: false
            referencedRelation: "contatos"
            referencedColumns: ["id"]
          },
        ]
      }
      alertas: {
        Row: {
          advogado_id: string
          contato_id: string
          created_at: string
          id: string
          read: boolean
          score: number
          summary: string
        }
        Insert: {
          advogado_id: string
          contato_id: string
          created_at?: string
          id?: string
          read?: boolean
          score?: number
          summary: string
        }
        Update: {
          advogado_id?: string
          contato_id?: string
          created_at?: string
          id?: string
          read?: boolean
          score?: number
          summary?: string
        }
        Relationships: [
          {
            foreignKeyName: "alertas_contato_id_fkey"
            columns: ["contato_id"]
            isOneToOne: false
            referencedRelation: "contatos"
            referencedColumns: ["id"]
          },
        ]
      }
      configuracoes: {
        Row: {
          created_at: string
          id: string
          lgpd_anonimizacao: boolean
          lgpd_auditoria: boolean
          lgpd_consentimento: boolean
          recuperacao_max_tentativas: number
          recuperacao_opt_out_auto: boolean
          recuperacao_template_d2: string
          recuperacao_timing_dias: number[]
          secretaria_horario_comercial: boolean
          secretaria_resposta_auto: boolean
          secretaria_template_boas_vindas: string
          secretaria_tom: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          lgpd_anonimizacao?: boolean
          lgpd_auditoria?: boolean
          lgpd_consentimento?: boolean
          recuperacao_max_tentativas?: number
          recuperacao_opt_out_auto?: boolean
          recuperacao_template_d2?: string
          recuperacao_timing_dias?: number[]
          secretaria_horario_comercial?: boolean
          secretaria_resposta_auto?: boolean
          secretaria_template_boas_vindas?: string
          secretaria_tom?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          lgpd_anonimizacao?: boolean
          lgpd_auditoria?: boolean
          lgpd_consentimento?: boolean
          recuperacao_max_tentativas?: number
          recuperacao_opt_out_auto?: boolean
          recuperacao_template_d2?: string
          recuperacao_timing_dias?: number[]
          secretaria_horario_comercial?: boolean
          secretaria_resposta_auto?: boolean
          secretaria_template_boas_vindas?: string
          secretaria_tom?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      contatos: {
        Row: {
          advogado_id: string
          created_at: string
          demand_type: Database["public"]["Enums"]["demand_type"] | null
          id: string
          last_msg_at: string | null
          name: string
          phone: string
          score_hot: number
          status: Database["public"]["Enums"]["contato_status"]
          updated_at: string
        }
        Insert: {
          advogado_id: string
          created_at?: string
          demand_type?: Database["public"]["Enums"]["demand_type"] | null
          id?: string
          last_msg_at?: string | null
          name?: string
          phone: string
          score_hot?: number
          status?: Database["public"]["Enums"]["contato_status"]
          updated_at?: string
        }
        Update: {
          advogado_id?: string
          created_at?: string
          demand_type?: Database["public"]["Enums"]["demand_type"] | null
          id?: string
          last_msg_at?: string | null
          name?: string
          phone?: string
          score_hot?: number
          status?: Database["public"]["Enums"]["contato_status"]
          updated_at?: string
        }
        Relationships: []
      }
      contratos: {
        Row: {
          advogado_id: string
          contato_id: string
          conteudo: string | null
          created_at: string
          file_url: string | null
          id: string
          status: string | null
          titulo: string
        }
        Insert: {
          advogado_id: string
          contato_id: string
          conteudo?: string | null
          created_at?: string
          file_url?: string | null
          id?: string
          status?: string | null
          titulo: string
        }
        Update: {
          advogado_id?: string
          contato_id?: string
          conteudo?: string | null
          created_at?: string
          file_url?: string | null
          id?: string
          status?: string | null
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "contratos_contato_id_fkey"
            columns: ["contato_id"]
            isOneToOne: false
            referencedRelation: "contatos"
            referencedColumns: ["id"]
          },
        ]
      }
      documentos: {
        Row: {
          contato_id: string
          created_at: string
          dados_extraidos: Json | null
          id: string
          tipo: string
          url: string | null
        }
        Insert: {
          contato_id: string
          created_at?: string
          dados_extraidos?: Json | null
          id?: string
          tipo: string
          url?: string | null
        }
        Update: {
          contato_id?: string
          created_at?: string
          dados_extraidos?: Json | null
          id?: string
          tipo?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documentos_contato_id_fkey"
            columns: ["contato_id"]
            isOneToOne: false
            referencedRelation: "contatos"
            referencedColumns: ["id"]
          },
        ]
      }
      integracoes_chatwoot: {
        Row: {
          chatwoot_account_id: string
          chatwoot_api_token: string
          chatwoot_base_url: string
          chatwoot_inbox_id: string
          created_at: string
          enabled: boolean
          id: string
          updated_at: string
          user_id: string
          webhook_secret: string
        }
        Insert: {
          chatwoot_account_id?: string
          chatwoot_api_token?: string
          chatwoot_base_url?: string
          chatwoot_inbox_id?: string
          created_at?: string
          enabled?: boolean
          id?: string
          updated_at?: string
          user_id: string
          webhook_secret?: string
        }
        Update: {
          chatwoot_account_id?: string
          chatwoot_api_token?: string
          chatwoot_base_url?: string
          chatwoot_inbox_id?: string
          created_at?: string
          enabled?: boolean
          id?: string
          updated_at?: string
          user_id?: string
          webhook_secret?: string
        }
        Relationships: []
      }
      kb_documents: {
        Row: {
          advogado_id: string
          content: string | null
          created_at: string
          file_url: string | null
          id: string
          titulo: string
        }
        Insert: {
          advogado_id: string
          content?: string | null
          created_at?: string
          file_url?: string | null
          id?: string
          titulo: string
        }
        Update: {
          advogado_id?: string
          content?: string | null
          created_at?: string
          file_url?: string | null
          id?: string
          titulo?: string
        }
        Relationships: []
      }
      mensagens: {
        Row: {
          ai_class: string | null
          contato_id: string
          content: string
          created_at: string
          direction: Database["public"]["Enums"]["msg_direction"]
          id: string
        }
        Insert: {
          ai_class?: string | null
          contato_id: string
          content: string
          created_at?: string
          direction: Database["public"]["Enums"]["msg_direction"]
          id?: string
        }
        Update: {
          ai_class?: string | null
          contato_id?: string
          content?: string
          created_at?: string
          direction?: Database["public"]["Enums"]["msg_direction"]
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mensagens_contato_id_fkey"
            columns: ["contato_id"]
            isOneToOne: false
            referencedRelation: "contatos"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          oab: string | null
          updated_at: string
          user_id: string
          whatsapp_phone: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          oab?: string | null
          updated_at?: string
          user_id: string
          whatsapp_phone?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          oab?: string | null
          updated_at?: string
          user_id?: string
          whatsapp_phone?: string | null
        }
        Relationships: []
      }
      relatorios: {
        Row: {
          advogado_id: string
          created_at: string
          id: string
          metrics_json: Json
          period_end: string
          period_start: string
          reativacoes: number
        }
        Insert: {
          advogado_id: string
          created_at?: string
          id?: string
          metrics_json?: Json
          period_end: string
          period_start: string
          reativacoes?: number
        }
        Update: {
          advogado_id?: string
          created_at?: string
          id?: string
          metrics_json?: Json
          period_end?: string
          period_start?: string
          reativacoes?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      contato_status: "novo" | "quente" | "esfriado" | "reativado" | "fechado"
      demand_type: "aposentadoria" | "inss" | "bpc_loas" | "revisao" | "outros"
      msg_direction: "in" | "out"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      contato_status: ["novo", "quente", "esfriado", "reativado", "fechado"],
      demand_type: ["aposentadoria", "inss", "bpc_loas", "revisao", "outros"],
      msg_direction: ["in", "out"],
    },
  },
} as const
