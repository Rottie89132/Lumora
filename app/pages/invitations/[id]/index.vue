<template>
	<div class="flex flex-col items-center justify-center h-[80vh] p-4 transition-colors duration-500 ">
		<div class="w-full max-w-md ">
			<div v-if="loading" class="flex flex-col items-center p-8 -mt-24">
				<icon class="text-gray-500 animate-spin" name="ri:loader-2-line" size="8em" />
				<h2 class="mt-6 text-xl font-semibold text-center">Verifying invitation...</h2>
				<p class="mt-2 text-center text-gray-500">Please wait while we verify your invitation link.</p>
			</div>

			<div v-else>
				<div v-if="success" class="p-4 -mt-24">
					<div class="flex flex-col items-center mb-6">
						<icon class="text-gray-500" name="ri:emotion-line" size="5em" />
						<h2 class="mt-4 text-2xl font-bold text-center">Invitation Valid!</h2>
						<p class="mt-2 text-center text-gray-500">You're invited to join this group.</p>
					</div>

					<div class="mb-6 space-y-4">
						<div class="p-4 rounded-lg bg-gray-50">
							<p class="text-sm text-gray-500">Group Name</p>
							<p class="text-lg font-semibold">{{ result.data.details.name  }}</p>
						</div>

						<div class="p-4 rounded-lg bg-gray-50">
							<p class="text-sm text-gray-500">Members</p>
							<p class="text-lg font-semibold">{{ result.data.details.members }}</p>
						</div>
					</div>

					<button @click="join" :disabled="loadButton" class="flex items-center justify-center w-full h-12 text-base font-semibold text-white border bg-[#756145]/80 rounded-xl hover:bg-[#756145]">
						<UtilsLoader :loading="loadButton" :label="result.data.details.auto_accept ? 'Join group' : 'Send request'" :numberCount="3" />
					</button>

				</div>

				<div v-if="failed" class="p-4 -mt-24">
					<div class="flex flex-col items-center mb-6">
						<icon class="text-gray-500" name="ri:emotion-sad-line" size="5em" />
						<h2 class="mt-4 text-2xl font-bold text-center">Invitation Invalid</h2>
						<p class="mt-2 text-center text-gray-500">The invitation has expired or isn't valid</p>
					</div>

					<div class="space-y-4">
						<button @click="router.back()" class="flex items-center justify-center w-full gap-2 p-2 px-3 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100">
							<Icon name="material-symbols:arrow-back-ios-new-rounded" class="w-4 h-4" />
							Take me back
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">

	const route = useRoute();
	const id = route.params.id as string;
	const token = route.query.token as string;

	const result = ref();

	const name = ref()

	useSeoMeta({
		title: "Lumora - Join Group",
		description: () => `You've been invited to join a the ${name.value} group. View shared moments and start contributing your own!`,
		ogTitle: "You're Invited to a Lumora Group",
		ogDescription: () => `Join the ${name.value} group on Lumora to explore photos, share memories, and connect with others.`,
		ogImage: `/apple-touch-icon.png`,
		ogUrl: "/",
		twitterTitle: "Join a Group on Lumora",
		twitterDescription:() => `Accept your invitation to the ${name.value} group and become part of the moment.`,
		twitterImage: `/apple-touch-icon.png`,
		twitterCard: "summary",
	});

	definePageMeta({
		middleware: "invite-redirecter",
		layout: "invite",
	});

	const { makeRequest } = useRetryableFetch({ throwOnError: false});

	const verifyInvite = async (id: string, token: string) => {

		const { data, error } = await makeRequest<invitationsDetails>(`/api/invitations/${id}/${token}`)

		if(data.value) {
			sessionStorage.removeItem(`${data.value.status.redirect?.split("/")[2]}_List`);
			sessionStorage.removeItem(`${data.value.status.redirect?.split("/")[2]}_Scroll`);

			result.value = data.value;
			success.value = true;

			name.value = data.value.data.details.name;
		}

		if(error.value) failed.value = true

		await new Promise((resolve) => setTimeout(resolve, 2000));
		
		if (result.value?.status?.joined && result.value.status.redirect) navigateTo(result.value.status.redirect)
		else loading.value = false;

	};

	const router = useRouter();
	
	const loading = ref(true);
	const loadButton = ref(false)
	const success = ref(false);
	const failed = ref(false);

	onMounted(async () => {
		await verifyInvite(id, token)
	});

	const join = async () => {

		loadButton.value = true
		const { data, error } = await makeRequest(`/api/invitations/accept/${id}/${token}`)

		setTimeout(() => {
			if(data.value) {
				loadButton.value = false
				if (data.value.status.redirect) navigateTo(data.value.status.redirect);
			}
		}, 1000);

		if(error.value) navigateTo("/moments")

	};
</script>

