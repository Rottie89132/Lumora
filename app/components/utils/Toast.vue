<template>
	<div class="fixed z-50 flex flex-col gap-2 right-6 bottom-9 md:right-[13rem]">
		<TransitionGroup name="toast">
			<div v-for="toast in toasts" :key="toast.id" class="w-[88vw] md:w-[30vw] flex  gap-4 p-2 px-3 rounded-xl shadow-lg border transition-all bg-white" :class="toastStyles(toast.type), toast.discard ? 'items-start' : 'items-center'" role="alert">
				<Icon :name="iconMap[toast.type]" class="text-4xl" />
				<div class="flex-1">
					<p class="text-sm font-medium text-black">{{ toast.message }}</p>
					<div v-if="toast.discard">
						<div class="flex gap-2 pt-2 mt-2 border-t border-gray-200">
							<button class="p-2 px-3 text-[#756145] text-xs border border-[#756145] hover:bg-gray-100 rounded-xl" @click="toast.discard">Discard</button>
							<button class="p-2 px-3 text-white bg-[#756145] text-xs border border-[#756145] rounded-xl" @click="toast.save">Save changes</button>
						</div>
					</div>
				</div>
				<button @click="toast.id !== undefined && removeToast(toast.id)" class="text-gray-800 hover:text-gray-900">
					<Icon name="ri:close-fill" size="1.5rem" />
				</button>
			</div>
		</TransitionGroup>
	</div>
</template>

<script setup lang="ts">
	const { toasts, removeToast } = useToast();

	const iconMap = {
		info: "ri:information-2-fill",
		success: "ri:checkbox-circle-fill",
		error: "ri:close-circle-fill",
		warning: "ri:alert-fill",
	};

	const toastStyles = (type: string) => {
		return {
			"text-blue-500 ": type === "info",
			"text-green-500 ": type === "success",
			"text-red-500 ": type === "error",
			"text-yellow-500 ": type === "warning",
		};
	};
</script>

<style scoped>
	.toast-enter-active,
	.toast-leave-active {
		transition: opacity 0.1s ease, transform 0.1s ease;
	}
	.toast-enter-from,
	.toast-leave-to {
		opacity: 0;
		transform: translateY(10px);
	}
</style>
