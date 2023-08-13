export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];
export type Table<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type Enum<T extends keyof Database["public"]["Enums"]> =
  Database["public"]["Enums"][T];
export interface Database {
  public: {
    Tables: {
      classes: {
        Row: {
          created_at: string | null;
          description: string | null;
          icon: string;
          id: number;
          name: string;
          subject: string;
          teacher: string;
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          icon?: string;
          id?: number;
          name?: string;
          subject?: string;
          teacher: string;
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          icon?: string;
          id?: number;
          name?: string;
          subject?: string;
          teacher?: string;
        };
        Relationships: [];
      };
      users: {
        Row: {
          avatar: string | null;
          created_at: string | null;
          displayname: string | null;
          email: string;
          id: string;
          password: string;
          username: string;
        };
        Insert: {
          avatar?: string | null;
          created_at?: string | null;
          displayname?: string | null;
          email: string;
          id?: string;
          password: string;
          username: string;
        };
        Update: {
          avatar?: string | null;
          created_at?: string | null;
          displayname?: string | null;
          email?: string;
          id?: string;
          password?: string;
          username?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
