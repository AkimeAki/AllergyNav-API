export interface Stores {
	id?: number;
	name?: string;
	address?: string;
	chain_id?: number | null;
	url?: string | null;
	deleted?: boolean;
	updated_at?: string;
	created_at?: string;
}

export interface Menu {
	id?: number;
	name?: string;
	store_id?: number;
	chain_id?: number | null;
	deleted?: boolean;
	updated_at?: string;
	created_at?: string;
	allergens?: Array<{
		id: number;
		name: string;
	}>;
}

export interface SessionData {
	inputAddStoreForm?: boolean;
}

export interface ApiMessage {
	status: "error" | "success";
	message: string;
}
