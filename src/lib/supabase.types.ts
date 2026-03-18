export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      courses: {
        Row: {
          id: string;
          code: string;
          name: string;
          description: string | null;
          units: number | null;
          prerequisites: string[] | null;
          corequisites: string[] | null;
          antirequisites: string[] | null;
          terms: string[] | null;
          department: string;
          level: number | null;
          created_at: string | null;
        };
        Insert: {
          id: string;
          code: string;
          name: string;
          description?: string | null;
          units?: number | null;
          prerequisites?: string[] | null;
          corequisites?: string[] | null;
          antirequisites?: string[] | null;
          terms?: string[] | null;
          department: string;
          level?: number | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          code?: string;
          name?: string;
          description?: string | null;
          units?: number | null;
          prerequisites?: string[] | null;
          corequisites?: string[] | null;
          antirequisites?: string[] | null;
          terms?: string[] | null;
          department?: string;
          level?: number | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
