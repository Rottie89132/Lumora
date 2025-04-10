<template>
	<div>
		<div class="flex items-center gap-2 mb-3 -mt-4">
			<FieldInputSearch :update="handleSearch" uri="/api/moments" url="/moments" />

			<button @click="createLinkFunction()" class="flex items-center justify-center p-2 px-2 text-white bg-[#756145] border border-[#756145] rounded-xl w-fit">
				<icon name="ri:attachment-2" size="1.4em" />
			</button>
			<button @click="createFunction()" class="flex items-center justify-center p-2 px-2 text-white bg-[#756145] border border-[#756145] rounded-xl w-fit">
				<icon name="ri:add-circle-line" size="1.4em" />
			</button>
		</div>
		<hr class="mb-3" />

		<section v-if="List.length >= 1 && !searchLoading" @scroll="updateScrollPercentage" v-bind="containerProps" class="overflow-y-auto h-[80vh]">
			<div v-bind="wrapperProps" class="flex flex-col w-full gap-3">
				<div :id="`${index}`" class="last:pb-[9.6rem]" v-for="(content, index) in List" :key="index">
					<LazyCardGroup :content />
				</div>
			</div>
			<UtilsButtonScroller :totalPages="totalPages" :loading="loading" :scrollPercentage="scrollPercentage" :scrollToTop="() => scrollToTop('smooth')" :scrollToBottom="() => scrollToBottom('smooth')" :Page="Page" />
		</section>

		<UtilsSearchIndicator v-else :loading="searchLoading">
			<icon class="text-gray-500" name="rivet-icons:sad" size="5em" />
			<h1 class="md:w-[30vw] text-center text-balance mt-5 border-b pb-4">
				<span v-if="searched"> No results found. Try a different search term or check for any typos in your query. </span>
				<span v-else> No groups found that you are currently a member of. You might want to create a new group or join an existing one. </span>
			</h1>
			<div class="flex md:w-[30vw] justify-center w-full gap-3 px-8">
				<button v-if="!searched" @click="createLinkFunction()" class="flex items-center justify-center p-2 px-2 text-white bg-[#756145] border border-[#756145] rounded-xl w-fit">
					<icon name="ri:attachment-2" size="1.4em" />
				</button>
				<button @click="createFunction()" class="flex items-center justify-center w-full gap-2 px-4 py-2 font-medium text-gray-700 border border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100">
					<Icon name="ri:add-circle-line" class="w-4 h-4" />
					Create Group
				</button>
			</div>
		</UtilsSearchIndicator>
	</div>
</template>

<script setup lang="ts">
	useHead({
		htmlAttrs: {
			lang: "en",
		},
	});

	useSeoMeta({
		title: "Lumora - Moments",
		description: "Bekijk de nieuwste en populairste posts op Lumora!",
		ogTitle: "Lumora",
		ogDescription: "Bekijk de nieuwste en populairste posts op Lumora!",
		ogImage: "/apple-touch-icon.png",
		ogUrl: "/",
		twitterTitle: "Lumora",
		twitterDescription: "Bekijk de nieuwste en populairste posts op Lumora!",
		twitterImage: "/apple-touch-icon.png",
		twitterCard: "summary",
	});

	definePageMeta({
		middleware: "unauthorized",
	});

	/*
	 ************************************************************************************
	 */

	

	const List: any = ref([]);
	const loading = ref(false);

	const totalPages = ref(0);
	const Page = ref(1);

	const { query } = useRoute();
	const searchTerm = ref(`${query.search || ""}`);
	const searchLoading = ref(false);
	const searched = ref(!!query.search);

	const { addToast } = useToast();
	const { makeRequest, data, error } = useRetryableFetch<ApiResponse<Group[]>>({ maxAttempts: 2, throwOnError: false });

	/*
	 ************************************************************************************
	 */

	await makeRequest(`/api/moments?search=${searchTerm.value}`);

	if (data.value) {
		List.value = data.value.data;
		totalPages.value = data.value.pagination?.total || 0;
	}

	const handleSearch = (data: any, error: any, loading: boolean) => {
		Page.value = 1;
		searchLoading.value = loading;
		searched.value = true;

		if (data.value) {
			List.value = data.value.data;
			totalPages.value = data.value.pagination?.total || 0;
		}

		if (error.value) List.value = [];
	};

	/*
	 ************************************************************************************
	 */

	const { containerProps, wrapperProps } = useVirtualList(List, { itemHeight: 0, overscan: 10 });
	const { scrollPercentage, scrollToTop, scrollToBottom, updateScrollPercentage } = useScroller(containerProps.ref);

	useInfiniteScroll(
		containerProps.ref,
		async () => {
			if (Page.value >= totalPages.value || loading.value) return;

			loading.value = true;
			Page.value += 1;

			await makeRequest(`/api/moments?search=${searchTerm.value}`);

			if (data.value && Array.isArray(data.value.data)) {
				new Promise((resolve) => setTimeout(resolve, 500));

				List.value.push(...data.value.data);
				totalPages.value = data.value.pagination?.total || 0;
				scrollPercentage.value = scrollPercentage.value / 2;
			}

			loading.value = false;
		},
		{ direction: "bottom", distance: 20 }
	);

	/*
	 ************************************************************************************
	 */

	const { updateModalValue }: any = inject("modal");
	const createFunction = () => {
		updateModalValue({
			open: true,
			type: "Create",
			name: "Create group",
			requestUrl: "/api/moments",
			onSuccess: handleSuccess,
			onError: handleError,
		});
	};

	const handleSuccess = async ({ response }: SuccessResponse<Group>) => {
		await new Promise((resolve) => setTimeout(resolve, 1000));
		if (response.status.redirect) navigateTo(response.status.redirect);

		setTimeout(() => {
			addToast({
				message: `Group has been created`,
				type: "success",
				duration: 5000,
			});
		}, 800);
	};

	const handleError = async ({ error, actions }: ErrorResponse) => {
		await new Promise((resolve) => setTimeout(resolve, 1000));
		if (error.data.error?.type == "fields") actions.setErrors(error.data.error.details);
	};

	/*
	 ************************************************************************************
	 */

	const createLinkFunction = () => {
		updateModalValue({
			open: true,
			type: "join",
			name: "Join group",
			requestUrl: "/api/invitations/",
			onSuccess: handleLinkSuccess,
			onError: handleLinkError,
		});
	};

	const handleLinkSuccess = async ({ response }: SuccessResponse<Group>) => {};

	const handleLinkError = async ({ error, actions }: ErrorResponse) => {};
</script>
