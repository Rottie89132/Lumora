<template>
	<div ref="target" class="pb-2 border-b h-fit md:h-16">
		<NuxtLink :to="`/moments/${content.id}`" class="flex items-center space-x-3">
			<div class="flex items-center justify-center w-12 h-12 overflow-hidden bg-gray-200 rounded-full">
				<img v-if="loaded && targetIsVisible" :src="content.media.url" alt="image" class="object-cover w-full h-full" />
				<icon v-else class="bg-gray-400 animate-spin" name="ri:loader-2-line" size="1.4em" />
			</div>
			<div class="flex-1 pl-3 border-l">
				<div class="flex justify-between">
					<h3 class="text-lg font-semibold">{{ content.name }}</h3>
					<ClientOnly>
						<p class="text-sm text-gray-500">{{ useTimeAgo(content.last_active).value }}</p>
					</ClientOnly>
					
				</div>
				<p class="-mt-1 text-sm text-gray-500">
					<span v-if="content.last_photo_posted_by.name">Last photo posted by: 
						<span class="block md:inline-block">
							<span class="font-bold text-gray-500 truncate">{{ content.last_photo_posted_by.name }}</span>
						</span>
					</span>
					<span v-else>No activity yet, check back later</span>
				</p>
			</div>
		</NuxtLink>
	</div>
</template>

<script setup lang="ts">
	const target = ref(null);
	const targetIsVisible = useElementVisibility(target);
	const loaded = ref(false);

	const { content } = defineProps({
		content: { type: Object, required: true },
	});

	watch(targetIsVisible, (value) => {
		if (value) {
			setTimeout(() => {
				const imageLoad = new Image();
				imageLoad.src = content.media.url;
				imageLoad.onload = () => (loaded.value = true);
			}, 500);
		}
	});
</script>
