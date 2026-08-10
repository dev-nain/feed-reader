export type Json =
	| string
	| number
	| boolean
	| null
	| { [key: string]: Json | undefined }
	| Json[];

export type Database = {
	graphql_public: {
		Tables: {
			[_ in never]: never;
		};
		Views: {
			[_ in never]: never;
		};
		Functions: {
			graphql: {
				Args: {
					extensions?: Json;
					operationName?: string;
					query?: string;
					variables?: Json;
				};
				Returns: Json;
			};
		};
		Enums: {
			[_ in never]: never;
		};
		CompositeTypes: {
			[_ in never]: never;
		};
	};
	public: {
		Tables: {
			categories: {
				Row: {
					created_at: string;
					id: number;
					name: string;
					position: number;
					user_id: string;
				};
				Insert: {
					created_at?: string;
					id?: never;
					name: string;
					position?: number;
					user_id: string;
				};
				Update: {
					created_at?: string;
					id?: never;
					name?: string;
					position?: number;
					user_id?: string;
				};
				Relationships: [];
			};
			collection_items: {
				Row: {
					added_at: string;
					collection_id: number;
					item_id: number;
				};
				Insert: {
					added_at?: string;
					collection_id: number;
					item_id: number;
				};
				Update: {
					added_at?: string;
					collection_id?: number;
					item_id?: number;
				};
				Relationships: [
					{
						foreignKeyName: "collection_items_collection_id_fkey";
						columns: ["collection_id"];
						isOneToOne: false;
						referencedRelation: "collections";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "collection_items_item_id_fkey";
						columns: ["item_id"];
						isOneToOne: false;
						referencedRelation: "feed_items";
						referencedColumns: ["id"];
					},
				];
			};
			collections: {
				Row: {
					created_at: string;
					id: number;
					name: string;
					position: number;
					user_id: string;
				};
				Insert: {
					created_at?: string;
					id?: never;
					name: string;
					position?: number;
					user_id: string;
				};
				Update: {
					created_at?: string;
					id?: never;
					name?: string;
					position?: number;
					user_id?: string;
				};
				Relationships: [];
			};
			feed_items: {
				Row: {
					author: string | null;
					content_blocks: Json | null;
					content_hash: string;
					created_at: string;
					feed_id: number;
					guid: string;
					id: number;
					image_url: string | null;
					published_at: string | null;
					sort_at: string | null;
					summary: string | null;
					title: string;
					updated_at: string;
					url: string | null;
				};
				Insert: {
					author?: string | null;
					content_blocks?: Json | null;
					content_hash: string;
					created_at?: string;
					feed_id: number;
					guid: string;
					id?: never;
					image_url?: string | null;
					published_at?: string | null;
					sort_at?: string | null;
					summary?: string | null;
					title: string;
					updated_at?: string;
					url?: string | null;
				};
				Update: {
					author?: string | null;
					content_blocks?: Json | null;
					content_hash?: string;
					created_at?: string;
					feed_id?: number;
					guid?: string;
					id?: never;
					image_url?: string | null;
					published_at?: string | null;
					sort_at?: string | null;
					summary?: string | null;
					title?: string;
					updated_at?: string;
					url?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: "feed_items_feed_id_fkey";
						columns: ["feed_id"];
						isOneToOne: false;
						referencedRelation: "feeds";
						referencedColumns: ["id"];
					},
				];
			};
			feeds: {
				Row: {
					consecutive_failures: number;
					created_at: string;
					curated_category: string | null;
					dead_at: string | null;
					description: string | null;
					etag: string | null;
					feed_format: string | null;
					feed_url: string;
					icon_url: string | null;
					id: number;
					language: string | null;
					last_error: string | null;
					last_error_at: string | null;
					last_fetched_at: string | null;
					last_modified: string | null;
					last_success_at: string | null;
					next_fetch_at: string | null;
					site_url: string | null;
					title: string;
					updated_at: string;
					url_key: string | null;
				};
				Insert: {
					consecutive_failures?: number;
					created_at?: string;
					curated_category?: string | null;
					dead_at?: string | null;
					description?: string | null;
					etag?: string | null;
					feed_format?: string | null;
					feed_url: string;
					icon_url?: string | null;
					id?: never;
					language?: string | null;
					last_error?: string | null;
					last_error_at?: string | null;
					last_fetched_at?: string | null;
					last_modified?: string | null;
					last_success_at?: string | null;
					next_fetch_at?: string | null;
					site_url?: string | null;
					title: string;
					updated_at?: string;
					url_key?: string | null;
				};
				Update: {
					consecutive_failures?: number;
					created_at?: string;
					curated_category?: string | null;
					dead_at?: string | null;
					description?: string | null;
					etag?: string | null;
					feed_format?: string | null;
					feed_url?: string;
					icon_url?: string | null;
					id?: never;
					language?: string | null;
					last_error?: string | null;
					last_error_at?: string | null;
					last_fetched_at?: string | null;
					last_modified?: string | null;
					last_success_at?: string | null;
					next_fetch_at?: string | null;
					site_url?: string | null;
					title?: string;
					updated_at?: string;
					url_key?: string | null;
				};
				Relationships: [];
			};
			item_states: {
				Row: {
					item_id: number;
					marked_unread_at: string | null;
					read_at: string | null;
					starred_at: string | null;
					user_id: string;
				};
				Insert: {
					item_id: number;
					marked_unread_at?: string | null;
					read_at?: string | null;
					starred_at?: string | null;
					user_id: string;
				};
				Update: {
					item_id?: number;
					marked_unread_at?: string | null;
					read_at?: string | null;
					starred_at?: string | null;
					user_id?: string;
				};
				Relationships: [
					{
						foreignKeyName: "item_states_item_id_fkey";
						columns: ["item_id"];
						isOneToOne: false;
						referencedRelation: "feed_items";
						referencedColumns: ["id"];
					},
				];
			};
			profiles: {
				Row: {
					created_at: string;
					display_name: string | null;
					id: string;
					personalisation: Json;
					updated_at: string;
				};
				Insert: {
					created_at?: string;
					display_name?: string | null;
					id: string;
					personalisation?: Json;
					updated_at?: string;
				};
				Update: {
					created_at?: string;
					display_name?: string | null;
					id?: string;
					personalisation?: Json;
					updated_at?: string;
				};
				Relationships: [];
			};
			subscriptions: {
				Row: {
					category_id: number | null;
					created_at: string;
					custom_title: string | null;
					feed_id: number;
					id: number;
					read_through_at: string | null;
					refresh_interval_minutes: number;
					user_id: string;
				};
				Insert: {
					category_id?: number | null;
					created_at?: string;
					custom_title?: string | null;
					feed_id: number;
					id?: never;
					read_through_at?: string | null;
					refresh_interval_minutes?: number;
					user_id: string;
				};
				Update: {
					category_id?: number | null;
					created_at?: string;
					custom_title?: string | null;
					feed_id?: number;
					id?: never;
					read_through_at?: string | null;
					refresh_interval_minutes?: number;
					user_id?: string;
				};
				Relationships: [
					{
						foreignKeyName: "subscriptions_category_fkey";
						columns: ["category_id", "user_id"];
						isOneToOne: false;
						referencedRelation: "categories";
						referencedColumns: ["id", "user_id"];
					},
					{
						foreignKeyName: "subscriptions_feed_id_fkey";
						columns: ["feed_id"];
						isOneToOne: false;
						referencedRelation: "feeds";
						referencedColumns: ["id"];
					},
				];
			};
		};
		Views: {
			[_ in never]: never;
		};
		Functions: {
			prune_feed_items: { Args: { retain_days?: number }; Returns: number };
		};
		Enums: {
			[_ in never]: never;
		};
		CompositeTypes: {
			[_ in never]: never;
		};
	};
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
	keyof Database,
	"public"
>];

export type Tables<
	DefaultSchemaTableNameOrOptions extends
		| keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
		| { schema: keyof DatabaseWithoutInternals },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
				DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
		: never = never,
> = DefaultSchemaTableNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
			DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
			Row: infer R;
		}
		? R
		: never
	: DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
				DefaultSchema["Views"])
		? (DefaultSchema["Tables"] &
				DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
				Row: infer R;
			}
			? R
			: never
		: never;

export type TablesInsert<
	DefaultSchemaTableNameOrOptions extends
		| keyof DefaultSchema["Tables"]
		| { schema: keyof DatabaseWithoutInternals },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
		: never = never,
> = DefaultSchemaTableNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
			Insert: infer I;
		}
		? I
		: never
	: DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
		? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
				Insert: infer I;
			}
			? I
			: never
		: never;

export type TablesUpdate<
	DefaultSchemaTableNameOrOptions extends
		| keyof DefaultSchema["Tables"]
		| { schema: keyof DatabaseWithoutInternals },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
		: never = never,
> = DefaultSchemaTableNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
			Update: infer U;
		}
		? U
		: never
	: DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
		? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
				Update: infer U;
			}
			? U
			: never
		: never;

export type Enums<
	DefaultSchemaEnumNameOrOptions extends
		| keyof DefaultSchema["Enums"]
		| { schema: keyof DatabaseWithoutInternals },
	EnumName extends DefaultSchemaEnumNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
		: never = never,
> = DefaultSchemaEnumNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
	: DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
		? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
		: never;

export type CompositeTypes<
	PublicCompositeTypeNameOrOptions extends
		| keyof DefaultSchema["CompositeTypes"]
		| { schema: keyof DatabaseWithoutInternals },
	CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
		: never = never,
> = PublicCompositeTypeNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
	: PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
		? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
		: never;

export const Constants = {
	graphql_public: {
		Enums: {},
	},
	public: {
		Enums: {},
	},
} as const;
