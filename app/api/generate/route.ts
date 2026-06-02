import { toFile } from "openai/uploads";
import { openai, IMAGE_MODEL } from "@/lib/openai";
import { supabase } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";

export async function POST(request: Request) {
	const secret = request.headers.get("x-internal-secret");
	const expectedSecret = process.env.INTERNAL_SECRET ?? "dev";
	if (secret !== expectedSecret) {
		return Response.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { orderId } = await request.json();
	if (!orderId) {
		return Response.json({ error: "Missing orderId" }, { status: 400 });
	}

	logger.info("generate:start", { orderId });

	const { data: order, error: orderError } = await supabase
		.from("orders")
		.select("*, poster_styles(prompt, name)")
		.eq("id", orderId)
		.single();

	if (orderError || !order) {
		await logger.error("generate:order_not_found", { orderId, error: orderError?.message });
		return Response.json({ error: "Order not found" }, { status: 404 });
	}

	if (order.payment_status !== "paid") {
		await logger.warn("generate:not_paid", { orderId, payment_status: order.payment_status });
		return Response.json({ error: "Order not paid" }, { status: 402 });
	}

	if (order.generation_status !== "pending") {
		logger.info("generate:already_claimed", { orderId, generation_status: order.generation_status });
		return Response.json({ message: "Already processing or completed" }, { status: 200 });
	}

	const { data: claimed } = await supabase
		.from("orders")
		.update({ generation_status: "processing", updated_at: new Date().toISOString() })
		.eq("id", orderId)
		.eq("generation_status", "pending")
		.select("id");

	if (!claimed || claimed.length === 0) {
		logger.info("generate:race_lost", { orderId });
		return Response.json({ message: "Already claimed by another process" }, { status: 200 });
	}

	logger.info("generate:claimed", { orderId, model: IMAGE_MODEL });

	const prompt = order.poster_styles?.prompt;
	if (!prompt) {
		await logger.error("generate:no_prompt", { orderId, style_id: order.style_id });
		await markFailed(orderId, "No prompt found for this style");
		return Response.json({ error: "No prompt" }, { status: 400 });
	}

	try {
		logger.info("generate:fetching_upload", { orderId });
		const uploadedImgResponse = await fetch(order.uploaded_image_url);
		if (!uploadedImgResponse.ok) throw new Error("Failed to fetch uploaded car image");
		const uploadedImgBuffer = Buffer.from(await uploadedImgResponse.arrayBuffer());
		const carImageFile = await toFile(uploadedImgBuffer, "car.png", { type: "image/png" });

		logger.info("generate:openai_call", { orderId, model: IMAGE_MODEL });

		const isDallE3 = IMAGE_MODEL === "dall-e-3";
		const response = isDallE3
			? await openai.images.generate({
					model: IMAGE_MODEL,
					prompt,
					n: 1,
					size: "1024x1024",
					quality: "hd",
					style: "vivid",
					response_format: "b64_json",
				})
			: await openai.images.edit({
					model: IMAGE_MODEL,
					image: carImageFile,
					prompt,
					n: 1,
					size: "1024x1024",
					quality: "high",
				});

		const b64 = response.data?.[0]?.b64_json;
		if (!b64) throw new Error("No image data returned from OpenAI");

		logger.info("generate:openai_done", { orderId });

		const imgBuffer = Buffer.from(b64, "base64");
		const posterPath = `${orderId}/poster.png`;

		logger.info("generate:uploading", { orderId, path: posterPath });

		const { error: storageError } = await supabase.storage.from("generated-cars").upload(posterPath, imgBuffer, {
			contentType: "image/png",
			upsert: true,
		});

		if (storageError) throw new Error(storageError.message);

		const { data: publicUrlData } = supabase.storage.from("generated-cars").getPublicUrl(posterPath);

		await supabase
			.from("orders")
			.update({
				generation_status: "completed",
				generated_poster_url: publicUrlData.publicUrl,
				updated_at: new Date().toISOString(),
			})
			.eq("id", orderId);

		logger.info("generate:completed", { orderId, posterUrl: publicUrlData.publicUrl });
		return Response.json({ success: true, posterUrl: publicUrlData.publicUrl });
	} catch (err) {
		const message = err instanceof Error ? err.message : "Generation failed";
		await logger.error("generate:failed", { orderId, error: message });
		await markFailed(orderId, message);
		return Response.json({ error: message }, { status: 500 });
	}
}

async function markFailed(orderId: string, message: string) {
	await supabase
		.from("orders")
		.update({
			generation_status: "failed",
			error_message: message,
			updated_at: new Date().toISOString(),
		})
		.eq("id", orderId);
}
