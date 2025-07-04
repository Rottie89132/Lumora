<template>
	<div>
		<div class="flex items-center gap-2 mb-3 -mt-4 sm:mt-2">
			<FieldInputSearch :disabled="searchLoading" :update="handleSearch" uri="/api/moments" url="/moments" />

			<button id="createLink" title="createLink" @click="createLinkFunction()" class="flex items-center justify-center p-2 px-2 text-white bg-[#756145] border border-[#756145] rounded-xl w-fit">
				<icon name="ri:attachment-2" size="1.4em" />
			</button>
			<button :disabled="searchLoading" id="reload" title="reload" @click="handleManualReload()" class="flex items-center justify-center p-2 px-2 text-white bg-[#756145] border border-[#756145] rounded-xl w-fit">
				<icon :class="searchLoading ? 'animate-spin' : ''" name="ri:refresh-line" size="1.4em" />
			</button>
			<button id="createGroup" title="createGroup" @click="createGroupFunction()" class="flex items-center justify-center p-2 px-2 text-white bg-[#756145] border border-[#756145] rounded-xl w-fit">
				<icon name="ri:image-circle-ai-line" size="1.4em" />
			</button>
		</div>
		<hr class="mb-3" />

		<section v-if="List.length >= 1 && !searchLoading" @scroll="updateScrollPercentage" v-bind="containerProps" class="overflow-y-auto h-[75dvh] md:h-[80dvh]">
			<div v-bind="wrapperProps" class="flex flex-col w-full gap-3">
				<div :id="content.id" class="last:pb-[9.6rem]" v-for="(content, index) in List" :key="content.id">
					<LazyCardGroup :content />
				</div>
			</div>
			<UtilsButtonScroller :totalPages="totalPages" :loading="loading" :scrollPercentage="scrollPercentage" :scrollToTop="() => scrollToTop('smooth')" :scrollToBottom="() => scrollToBottom('smooth')" :Page="Page" />
		</section>

		<UtilsSearchIndicator v-else :loading="searchLoading">
			<icon class="text-gray-500" name="ri:emotion-sad-line" size="5em" />

			<h1 class="md:w-[30vw] text-center text-balance mt-5 border-b pb-4">
				<span v-if="searched"> No results found. Try a different search term or check for any typos in your query. </span>
				<span v-else> No groups found that you are currently a member of. You might want to create a new group or join an existing one. </span>
			</h1>
			<div class="flex md:w-[30vw] justify-center w-full gap-3 px-8">
				<button v-if="!searched" @click="createLinkFunction()" class="flex items-center justify-center p-2 px-2 text-white bg-[#756145] border border-[#756145] rounded-xl w-fit">
					<icon name="ri:attachment-2" size="1.4em" />
				</button>
				<button @click="createGroupFunction()" class="flex items-center justify-center w-full gap-2 px-4 py-2 font-medium text-gray-700 border border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100">
					<Icon name="ri:image-circle-ai-line" class="w-4 h-4" />
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
		description: "Browse all your photo groups and relive shared memories on Lumora Moments.",
		ogTitle: "Lumora - Your Photo Groups",
		ogDescription: "See all your groups in one place. Explore shared photos, memories, and community moments.",
		ogImage: "/apple-touch-icon.png",
		ogUrl: "/",
		twitterTitle: "Lumora - Moments",
		twitterDescription: "Your groups, your memories. Discover all your shared moments on Lumora.",
		twitterImage: "/apple-touch-icon.png",
		twitterCard: "summary",
	});

	definePageMeta({
		middleware: "unauthorized",
	});

	/*
	 ************************************************************************************
	 */

	const loading = ref(false);

	const totalPages = ref(0);
	const Page = ref(1);

	const { query } = useRoute();
	const searchTerm = ref(`${query.search || ""}`);
	const searchLoading = ref(false);
	const searched = ref(!!query.search);

	/*
	 ************************************************************************************
	 */

	const overview = useApi<GroupOverview[]>();
	const List = ref<GroupOverview[]>([]);

	overview.prepare({
		baseURL: "/api/moments",
		options: { params: { search: searchTerm.value } },
		onSuccess: ({ response, action }) => {
			List.value = response.data;
			totalPages.value = response.pagination?.total || 0;
		},
		onError: ({ error, updated }) => {
			if (updated)
				addToast({
					message: `An error occurred, unable to fetch`,
					type: "error",
					duration: 5000,
				});
		},
	});

	await overview.load();

	/*
	 ************************************************************************************
	 */

	const handleSearch = (result: Ref<ApiResponse<GroupOverview[]>>, error: Ref<ErrorResponse>, loading: boolean) => {
		Page.value = 1;
		searchLoading.value = loading;
		searched.value = true;

		if (result.value) {
			List.value = result.value.data;
			totalPages.value = result.value.pagination?.total || 0;
		}

		if (error.value) List.value = [];
	};

	const handleManualReload = async () => {
		Page.value = 1;
		searchLoading.value = true;

		await overview.reload({
			params: { search: searchTerm.value },
		});

		setTimeout(() => {
			searchLoading.value = false;
		}, 1500);
	};

	/*
	 ************************************************************************************
	 */

	const { containerProps, wrapperProps } = useVirtualList(List, { itemHeight: 0, overscan: 10 });
	const { scrollPercentage, scrollToTop, scrollToBottom, updateScrollPercentage } = useScroller(containerProps.ref);

	const { makeRequest } = useRetryableFetch({ throwOnError: false });

	useInfiniteScroll(
		containerProps.ref,
		async () => {
			if (Page.value >= totalPages.value || loading.value) return;

			loading.value = true;
			Page.value += 1;

			const { data } = await makeRequest<GroupOverview[]>(`/api/moments`, {
				params: {
					page: Page.value,
					search: searchTerm.value,
				},
			});

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

	const { open } = useModal();
	const { addToast } = useToast();

	const createGroupFunction = async () => {
		const { onSuccess } = open({
			type: "Create",
			name: "Create Group",
			url: "/api/moments",
		});

		onSuccess(async () => {
			setTimeout(
				() =>
					addToast({
						message: `Group has been created`,
						type: "success",
						duration: 5000,
					}),
				800
			);
		});
	};

	/*
	 ************************************************************************************
	 */

	const createLinkFunction = () =>
		open({
			type: "join",
			name: "Join group",
			url: "/api/invitations/",
		});
</script>
