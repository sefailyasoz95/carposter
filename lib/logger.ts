import { supabase } from "@/lib/supabase/server";

type Meta = Record<string, unknown>;

async function persist(json: object, isPaymentSucc: boolean | null): Promise<void> {
	try {
		const { error } = await supabase.from("Logs").insert({ json, is_payment_success: isPaymentSucc });
		if (error) console.error("[logger] db write failed:", error.message);
	} catch (err) {
		console.error("[logger] persist threw:", err);
	}
}

export const logger = {
	/** Console only — not written to DB. */
	info: (message: string, meta?: Meta) => {
		console.log(JSON.stringify({ ts: new Date().toISOString(), level: "info", message, ...(meta ?? {}) }));
	},

	/** Written to DB — await this before returning from your route. */
	warn: async (message: string, meta?: Meta): Promise<void> => {
		const entry = { ts: new Date().toISOString(), level: "warn", message, ...(meta ?? {}) };
		console.warn(JSON.stringify(entry));
		await persist(entry, null);
	},

	/** Written to DB — await this before returning from your route. */
	error: async (message: string, meta?: Meta): Promise<void> => {
		const entry = { ts: new Date().toISOString(), level: "error", message, ...(meta ?? {}) };
		console.error(JSON.stringify(entry));
		await persist(entry, null);
	},

	/** Always written to DB with is_payment_succ flag — await this before returning. */
	payment: async (success: boolean, message: string, meta?: Meta): Promise<void> => {
		const level = success ? "info" : "error";
		const entry = { ts: new Date().toISOString(), level, message, ...(meta ?? {}) };
		if (success) console.log(JSON.stringify(entry));
		else console.error(JSON.stringify(entry));
		await persist(entry, success);
	},
};
