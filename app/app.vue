<template>
	<div>
		<NuxtRouteAnnouncer />
		<NuxtLayout>
			<NuxtPage></NuxtPage>
		</NuxtLayout>
	</div>
</template>

<script setup>


</script>

<style>
	.page-enter-active,
	.page-leave-active {
		transition: all 0.3s;
	}
	.page-enter-from,
	.page-leave-to {
		opacity: 0;
	}

</style>
