<template>
	<FieldFormBaseLayer class="mb-5" :callback :url :onSuccess :onError :resize :method :schema label="Upload">
		<template v-slot="{ errors }">
			<div class="py-3 mt-5 border-y h-fit">
				<FieldInputMultipleImages label="images" name="images" />
				<p class="mt-2 text-red-700">
					{{ errors.message }}
				</p>
			</div>
		</template>
	</FieldFormBaseLayer>
</template>

<script setup lang="ts">
	import { toTypedSchema } from "@vee-validate/zod";
	import * as zod from "zod";

	const { url, onSuccess, onError, method } = defineProps({
		callback: { type: Function, required: false },
		url: { type: String, required: true },
		onSuccess: { type: Function, required: true },
		onError: { type: Function, required: true },
		method: { type: String, default: "POST" },
		resize: { type: Boolean, default: false },
	});

	const schema = toTypedSchema(
		zod.object({
			images: zod
				.array(
					zod
						.instanceof(File)
						.refine((file) => file.size <= 5 * 1024 * 1024, { message: "File size must not exceed 5MB" })
						.refine((file) => ["image/png", "image/jpeg"].includes(file.type), { message: "Only PNG or JPEG files are allowed" })
				)
				.min(1, { message: "You must upload at least one image" })
				.max(4, { message: "Maximum of 4 images allowed" })
				.or(zod.literal(undefined).transform(() => [])),
		})
	);
</script>
