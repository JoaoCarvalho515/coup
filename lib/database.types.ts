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
        PostgrestVersion: "13.0.5"
    }
    public: {
        Tables: {
            cards: {
                Row: {
                    card_order: number | null
                    character: string
                    created_at: string | null
                    game_id: string
                    id: string
                    location: string
                    player_id: string | null
                    revealed: boolean
                    updated_at: string | null
                }
                Insert: {
                    card_order?: number | null
                    character: string
                    created_at?: string | null
                    game_id: string
                    id?: string
                    location: string
                    player_id?: string | null
                    revealed?: boolean
                    updated_at?: string | null
                }
                Update: {
                    card_order?: number | null
                    character?: string
                    created_at?: string | null
                    game_id?: string
                    id?: string
                    location?: string
                    player_id?: string | null
                    revealed?: boolean
                    updated_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "cards_game_id_fkey"
                        columns: ["game_id"]
                        isOneToOne: false
                        referencedRelation: "games"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "cards_player_id_fkey"
                        columns: ["player_id"]
                        isOneToOne: false
                        referencedRelation: "players"
                        referencedColumns: ["id"]
                    },
                ]
            }
            game_actions: {
                Row: {
                    action_type: string
                    claimed_character: string | null
                    created_at: string | null
                    game_id: string
                    id: string
                    player_id: string | null
                    result: string | null
                    target_player_id: string | null
                }
                Insert: {
                    action_type: string
                    claimed_character?: string | null
                    created_at?: string | null
                    game_id: string
                    id?: string
                    player_id?: string | null
                    result?: string | null
                    target_player_id?: string | null
                }
                Update: {
                    action_type?: string
                    claimed_character?: string | null
                    created_at?: string | null
                    game_id?: string
                    id?: string
                    player_id?: string | null
                    result?: string | null
                    target_player_id?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "game_actions_game_id_fkey"
                        columns: ["game_id"]
                        isOneToOne: false
                        referencedRelation: "games"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "game_actions_player_id_fkey"
                        columns: ["player_id"]
                        isOneToOne: false
                        referencedRelation: "players"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "game_actions_target_player_id_fkey"
                        columns: ["target_player_id"]
                        isOneToOne: false
                        referencedRelation: "players"
                        referencedColumns: ["id"]
                    },
                ]
            }
            games: {
                Row: {
                    code: string
                    created_at: string | null
                    current_player_index: number
                    id: string
                    phase: string
                    status: string
                    updated_at: string | null
                    winner_id: string | null
                }
                Insert: {
                    code: string
                    created_at?: string | null
                    current_player_index?: number
                    id?: string
                    phase: string
                    status: string
                    updated_at?: string | null
                    winner_id?: string | null
                }
                Update: {
                    code?: string
                    created_at?: string | null
                    current_player_index?: number
                    id?: string
                    phase?: string
                    status?: string
                    updated_at?: string | null
                    winner_id?: string | null
                }
                Relationships: []
            }
            pending_actions: {
                Row: {
                    action_type: string
                    actor_id: string
                    blocker_id: string | null
                    challenger_id: string | null
                    claimed_character: string | null
                    created_at: string | null
                    game_id: string
                    id: string
                    is_block: boolean
                    is_challenge: boolean
                    target_id: string | null
                }
                Insert: {
                    action_type: string
                    actor_id: string
                    blocker_id?: string | null
                    challenger_id?: string | null
                    claimed_character?: string | null
                    created_at?: string | null
                    game_id: string
                    id?: string
                    is_block?: boolean
                    is_challenge?: boolean
                    target_id?: string | null
                }
                Update: {
                    action_type?: string
                    actor_id?: string
                    blocker_id?: string | null
                    challenger_id?: string | null
                    claimed_character?: string | null
                    created_at?: string | null
                    game_id?: string
                    id?: string
                    is_block?: boolean
                    is_challenge?: boolean
                    target_id?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "pending_actions_actor_id_fkey"
                        columns: ["actor_id"]
                        isOneToOne: false
                        referencedRelation: "players"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "pending_actions_blocker_id_fkey"
                        columns: ["blocker_id"]
                        isOneToOne: false
                        referencedRelation: "players"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "pending_actions_challenger_id_fkey"
                        columns: ["challenger_id"]
                        isOneToOne: false
                        referencedRelation: "players"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "pending_actions_game_id_fkey"
                        columns: ["game_id"]
                        isOneToOne: true
                        referencedRelation: "games"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "pending_actions_target_id_fkey"
                        columns: ["target_id"]
                        isOneToOne: false
                        referencedRelation: "players"
                        referencedColumns: ["id"]
                    },
                ]
            }
            players: {
                Row: {
                    coins: number
                    created_at: string | null
                    game_id: string
                    id: string
                    is_alive: boolean
                    name: string
                    player_order: number
                    updated_at: string | null
                    user_id: string | null
                }
                Insert: {
                    coins?: number
                    created_at?: string | null
                    game_id: string
                    id?: string
                    is_alive?: boolean
                    name: string
                    player_order: number
                    updated_at?: string | null
                    user_id?: string | null
                }
                Update: {
                    coins?: number
                    created_at?: string | null
                    game_id?: string
                    id?: string
                    is_alive?: boolean
                    name?: string
                    player_order?: number
                    updated_at?: string | null
                    user_id?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "players_game_id_fkey"
                        columns: ["game_id"]
                        isOneToOne: false
                        referencedRelation: "games"
                        referencedColumns: ["id"]
                    },
                ]
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
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
        Enums: {},
    },
} as const
