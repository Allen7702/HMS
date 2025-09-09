export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          created_at: string
          data_after: Json | null
          data_before: Json | null
          details: Json | null
          entity_id: number | null
          entity_type: string
          id: number
          updated_at: string
          user_id: number | null
        }
        Insert: {
          action: string
          created_at?: string
          data_after?: Json | null
          data_before?: Json | null
          details?: Json | null
          entity_id?: number | null
          entity_type: string
          id?: number
          updated_at?: string
          user_id?: number | null
        }
        Update: {
          action?: string
          created_at?: string
          data_after?: Json | null
          data_before?: Json | null
          details?: Json | null
          entity_id?: number | null
          entity_type?: string
          id?: number
          updated_at?: string
          user_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_users_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          check_in: string
          check_out: string
          created_at: string
          guest_id: number | null
          id: number
          rate_applied: number
          room_id: number | null
          source: string | null
          status: Database["public"]["Enums"]["booking_status"]
          updated_at: string
        }
        Insert: {
          check_in: string
          check_out: string
          created_at?: string
          guest_id?: number | null
          id?: number
          rate_applied: number
          room_id?: number | null
          source?: string | null
          status: Database["public"]["Enums"]["booking_status"]
          updated_at?: string
        }
        Update: {
          check_in?: string
          check_out?: string
          created_at?: string
          guest_id?: number | null
          id?: number
          rate_applied?: number
          room_id?: number | null
          source?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_guest_id_guests_id_fk"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "guests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_room_id_rooms_id_fk"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      guests: {
        Row: {
          address: string | null
          created_at: string
          email: string
          gdpr_consent: boolean | null
          id: number
          loyalty_points: number | null
          loyalty_tier: Database["public"]["Enums"]["loyalty_tier"] | null
          name: string
          phone: string | null
          preferences: Json | null
          updated_at: string
          user_id: number | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          email: string
          gdpr_consent?: boolean | null
          id?: number
          loyalty_points?: number | null
          loyalty_tier?: Database["public"]["Enums"]["loyalty_tier"] | null
          name: string
          phone?: string | null
          preferences?: Json | null
          updated_at?: string
          user_id?: number | null
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string
          gdpr_consent?: boolean | null
          id?: number
          loyalty_points?: number | null
          loyalty_tier?: Database["public"]["Enums"]["loyalty_tier"] | null
          name?: string
          phone?: string | null
          preferences?: Json | null
          updated_at?: string
          user_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "guests_user_id_users_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      housekeepings: {
        Row: {
          assignee_id: number | null
          completed_at: string | null
          created_at: string
          id: number
          notes: string | null
          room_id: number | null
          scheduled_date: string | null
          status: Database["public"]["Enums"]["housekeeping_status"]
          updated_at: string
        }
        Insert: {
          assignee_id?: number | null
          completed_at?: string | null
          created_at?: string
          id?: number
          notes?: string | null
          room_id?: number | null
          scheduled_date?: string | null
          status: Database["public"]["Enums"]["housekeeping_status"]
          updated_at?: string
        }
        Update: {
          assignee_id?: number | null
          completed_at?: string | null
          created_at?: string
          id?: number
          notes?: string | null
          room_id?: number | null
          scheduled_date?: string | null
          status?: Database["public"]["Enums"]["housekeeping_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "housekeepings_assignee_id_users_id_fk"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "housekeepings_room_id_rooms_id_fk"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount: number
          booking_id: number | null
          created_at: string
          due_date: string | null
          id: number
          invoice_number: string | null
          issue_date: string
          status: Database["public"]["Enums"]["invoice_status"]
          tax: number
          updated_at: string
        }
        Insert: {
          amount: number
          booking_id?: number | null
          created_at?: string
          due_date?: string | null
          id?: number
          invoice_number?: string | null
          issue_date?: string
          status?: Database["public"]["Enums"]["invoice_status"]
          tax: number
          updated_at?: string
        }
        Update: {
          amount?: number
          booking_id?: number | null
          created_at?: string
          due_date?: string | null
          id?: number
          invoice_number?: string | null
          issue_date?: string
          status?: Database["public"]["Enums"]["invoice_status"]
          tax?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_booking_id_bookings_id_fk"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenances: {
        Row: {
          assignee_id: number | null
          created_at: string
          description: string
          history: Json | null
          id: number
          priority: Database["public"]["Enums"]["maintenance_priority"]
          room_id: number | null
          status: Database["public"]["Enums"]["maintenance_status"]
          updated_at: string
        }
        Insert: {
          assignee_id?: number | null
          created_at?: string
          description: string
          history?: Json | null
          id?: number
          priority: Database["public"]["Enums"]["maintenance_priority"]
          room_id?: number | null
          status: Database["public"]["Enums"]["maintenance_status"]
          updated_at?: string
        }
        Update: {
          assignee_id?: number | null
          created_at?: string
          description?: string
          history?: Json | null
          id?: number
          priority?: Database["public"]["Enums"]["maintenance_priority"]
          room_id?: number | null
          status?: Database["public"]["Enums"]["maintenance_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenances_assignee_id_users_id_fk"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenances_room_id_rooms_id_fk"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          entity_type: string | null
          guest_id: number | null
          id: number
          message: string
          recipient: string
          related_entity_id: number | null
          status: Database["public"]["Enums"]["notification_status"]
          type: Database["public"]["Enums"]["notification_type"]
          updated_at: string
          user_id: number | null
        }
        Insert: {
          created_at?: string
          entity_type?: string | null
          guest_id?: number | null
          id?: number
          message: string
          recipient: string
          related_entity_id?: number | null
          status: Database["public"]["Enums"]["notification_status"]
          type: Database["public"]["Enums"]["notification_type"]
          updated_at?: string
          user_id?: number | null
        }
        Update: {
          created_at?: string
          entity_type?: string | null
          guest_id?: number | null
          id?: number
          message?: string
          recipient?: string
          related_entity_id?: number | null
          status?: Database["public"]["Enums"]["notification_status"]
          type?: Database["public"]["Enums"]["notification_type"]
          updated_at?: string
          user_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_guest_id_guests_id_fk"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "guests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_users_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      ota_reservations: {
        Row: {
          booking_id: number | null
          created_at: string
          id: number
          ota_id: string
          ota_name: Database["public"]["Enums"]["ota_name"]
          updated_at: string
        }
        Insert: {
          booking_id?: number | null
          created_at?: string
          id?: number
          ota_id: string
          ota_name: Database["public"]["Enums"]["ota_name"]
          updated_at?: string
        }
        Update: {
          booking_id?: number | null
          created_at?: string
          id?: number
          ota_id?: string
          ota_name?: Database["public"]["Enums"]["ota_name"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ota_reservations_booking_id_bookings_id_fk"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          id: number
          invoice_id: number | null
          method: Database["public"]["Enums"]["payment_method"] | null
          processed_at: string
          status: Database["public"]["Enums"]["payment_status"]
          transaction_id: string | null
        }
        Insert: {
          amount: number
          id?: number
          invoice_id?: number | null
          method?: Database["public"]["Enums"]["payment_method"] | null
          processed_at?: string
          status?: Database["public"]["Enums"]["payment_status"]
          transaction_id?: string | null
        }
        Update: {
          amount?: number
          id?: number
          invoice_id?: number | null
          method?: Database["public"]["Enums"]["payment_method"] | null
          processed_at?: string
          status?: Database["public"]["Enums"]["payment_status"]
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_invoice_id_invoices_id_fk"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      room_types: {
        Row: {
          capacity: number
          description: string | null
          id: number
          name: string
          price_modifier: number | null
        }
        Insert: {
          capacity?: number
          description?: string | null
          id?: number
          name: string
          price_modifier?: number | null
        }
        Update: {
          capacity?: number
          description?: string | null
          id?: number
          name?: string
          price_modifier?: number | null
        }
        Relationships: []
      }
      rooms: {
        Row: {
          created_at: string
          features: Json | null
          floor: number
          id: number
          last_cleaned: string | null
          room_number: string
          room_type_id: number | null
          status: Database["public"]["Enums"]["room_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          features?: Json | null
          floor: number
          id?: number
          last_cleaned?: string | null
          room_number: string
          room_type_id?: number | null
          status?: Database["public"]["Enums"]["room_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          features?: Json | null
          floor?: number
          id?: number
          last_cleaned?: string | null
          room_number?: string
          room_type_id?: number | null
          status?: Database["public"]["Enums"]["room_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rooms_room_type_id_room_types_id_fk"
            columns: ["room_type_id"]
            isOneToOne: false
            referencedRelation: "room_types"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: number
          password: string
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string
          username: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id?: number
          password: string
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string
          username: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: number
          password?: string
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string
          username?: string
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
      booking_status:
        | "Pending"
        | "Confirmed"
        | "CheckedIn"
        | "CheckedOut"
        | "Cancelled"
      housekeeping_status: "Pending" | "In Progress" | "Completed"
      invoice_status: "Draft" | "Unpaid" | "Paid" | "Void"
      loyalty_tier: "None" | "Bronze" | "Silver" | "Gold"
      maintenance_priority: "Low" | "Medium" | "High"
      maintenance_status: "Open" | "In Progress" | "Resolved"
      notification_status: "Pending" | "Sent" | "Failed"
      notification_type: "Email" | "SMS" | "Push"
      ota_name: "Booking.com" | "Expedia" | "Agoda" | "Other"
      payment_method: "Credit Card" | "PayPal" | "Bank Transfer" | "Cash"
      payment_status: "Pending" | "Completed" | "Failed" | "Refunded"
      room_status: "Available" | "Occupied" | "Maintenance" | "Dirty"
      user_role: "admin" | "manager" | "staff"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      booking_status: [
        "Pending",
        "Confirmed",
        "CheckedIn",
        "CheckedOut",
        "Cancelled",
      ],
      housekeeping_status: ["Pending", "In Progress", "Completed"],
      invoice_status: ["Draft", "Unpaid", "Paid", "Void"],
      loyalty_tier: ["None", "Bronze", "Silver", "Gold"],
      maintenance_priority: ["Low", "Medium", "High"],
      maintenance_status: ["Open", "In Progress", "Resolved"],
      notification_status: ["Pending", "Sent", "Failed"],
      notification_type: ["Email", "SMS", "Push"],
      ota_name: ["Booking.com", "Expedia", "Agoda", "Other"],
      payment_method: ["Credit Card", "PayPal", "Bank Transfer", "Cash"],
      payment_status: ["Pending", "Completed", "Failed", "Refunded"],
      room_status: ["Available", "Occupied", "Maintenance", "Dirty"],
      user_role: ["admin", "manager", "staff"],
    },
  },
} as const

