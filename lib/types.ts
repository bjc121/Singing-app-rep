export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type RecordingStatus =
  | "CREATED"
  | "UPLOADING"
  | "UPLOADED"
  | "PROCESSING"
  | "DONE"
  | "FAILED"
  | "DELETED";

export interface Database {
  public: {
    Tables: {
      recordings: {
        Row: {
          id: string;
          user_id: string;
          created_at: string;
          updated_at: string;
          title: string | null;
          duration_sec: number;
          storage_path: string;
          mime_type: string;
          status: RecordingStatus;
          parent_recording_id: string | null;
          genre: string | null;
          error_message: string | null;
        };
        Insert: Partial<Omit<Database["public"]["Tables"]["recordings"]["Row"], "created_at" | "updated_at">> & {
          id: string;
          user_id: string;
          duration_sec: number;
          storage_path: string;
          mime_type: string;
          status: RecordingStatus;
        }>;
        Update: Partial<Database["public"]["Tables"]["recordings"]["Row"]>;
      };
      transcripts: {
        Row: {
          id: string;
          recording_id: string;
          text: string;
          words_json: Json | null;
        };
        Insert: {
          id?: string;
          recording_id: string;
          text: string;
          words_json?: Json | null;
        };
        Update: Partial<Database["public"]["Tables"]["transcripts"]["Row"]>;
      };
      evaluations: {
        Row: {
          id: string;
          recording_id: string;
          rubric_version: string;
          overall_score: number;
          scores_json: Json;
          highlights: string[];
          bottlenecks: string[];
          timecoded_notes_json: Json;
          drills_json: Json;
          coach_text: string;
        };
        Insert: {
          id?: string;
          recording_id: string;
          rubric_version?: string;
          overall_score: number;
          scores_json: Json;
          highlights: string[];
          bottlenecks: string[];
          timecoded_notes_json: Json;
          drills_json: Json;
          coach_text: string;
        };
        Update: Partial<Database["public"]["Tables"]["evaluations"]["Row"]>;
      };
      feature_summaries: {
        Row: {
          id: string;
          recording_id: string;
          voiced_pct: number | null;
          median_f0_hz: number | null;
          pitch_std_hz: number | null;
          rms_avg: number | null;
          rms_std: number | null;
          computed_json: Json | null;
        };
        Insert: {
          id?: string;
          recording_id: string;
          voiced_pct?: number | null;
          median_f0_hz?: number | null;
          pitch_std_hz?: number | null;
          rms_avg?: number | null;
          rms_std?: number | null;
          computed_json?: Json | null;
        };
        Update: Partial<Database["public"]["Tables"]["feature_summaries"]["Row"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
