<template>
	<div>
		<div class="sticky z-50 pt-3 -mt-5 bg-white -top-4">
			<div class="flex items-center justify-between w-full gap-2 mb-3 md:justify-end">
				<FieldInputSearch class="hidden md:flex" placeholder="Search member..." :update="handleSearch" :uri="`/api/moments/members/${group_id}`" />

				<button v-if="content?.permision?.create" @click="CreateLink" :disabled="loading" class="flex w-full md:w-40 items-center justify-center gap-2 p-2 px-2 text-sm text-[#756145] hover:bg-gray-50 border border-[#756145] rounded-xl"><span> Create link </span></button>
				<button :disabled="loading" @click="clickButton" v-if="content?.permision?.edit" class="flex w-full md:w-44 items-center justify-center gap-2 p-2 px-3 text-sm text-white bg-[#756145] border border-[#756145] rounded-xl">
					<icon v-if="loading" class="animate-spin" size="1.2rem" name="ri:refresh-line" />
					<span v-else> Update group</span>
				</button>
				<button v-if="content?.permision?.delete" @click="deleteData" class="flex w-full md:w-44 items-center justify-center gap-2 p-2 px-2 text-sm text-white bg-[#756145] border border-[#756145] rounded-xl">Delete group</button>
				<button v-else @click="leaveGroup" class="flex w-full md:w-44 items-center justify-center gap-2 p-2 px-2 text-sm text-white bg-[#756145] border border-[#756145] rounded-xl">Leave group<span class="hidden md:flex"></span></button>
			</div>
			<FieldInputSearch class="md:hidden" placeholder="Search member..." :update="handleSearch" :uri="`/api/moments/members/${group_id}`" />
			<hr class="pb-3 mt-3" />
		</div>

		<div :class="PWAInstalled ? 'pb-32' : 'pb-20'" class="flex flex-col gap-4 overflow-scroll">
			<div class="p-4 border rounded-xl">
				<Form :validation-schema="schema" v-slot="{ meta, errors }: any" @submit="handleSubmit">
					<div class="flex items-center justify-between mb-1">
						<h1 class="font-bold">Group details</h1>
						<button ref="hidden" :disabled="loading" v-if="content?.permision?.edit" class="sr-only"></button>
					</div>
					<p class="mb-3 text-sm text-gray-500">Update the group information.</p>

					<hr class="mb-2" />

					<field name="name" v-slot="{ field, meta }: any" v-model="name">
						<div class="space-y-2">
							<label class="text-sm font-medium text-gray-700" for="name">
								Group name
								<transition name="fade">
									<span v-if="meta.validated && !meta.valid" class="text-red-700">({{ meta.errors[0] || "Er is een probleem met dit veld" }})</span>
								</transition>
							</label>

							<div class="flex gap-2">
								<input :disabled="!content?.permision?.edit || loading" placeholder="Enter a unique and catchy name!" v-bind="field" id="name" :value="name" type="text" ref="nameData" :class="meta.validated && !meta.valid ? ' btn-Input-Error' : 'btn-Input'" class="z-10 w-full p-2 px-3 transition-colors duration-300 border appearance-none disabled:bg-gray-50 rounded-xl" />
							</div>
						</div>
					</field>

					<field name="description" v-slot="{ field, meta }: any" v-model="description">
						<div class="mt-1 space-y-2">
							<label class="text-sm font-medium text-gray-700" for="description">
								Description
								<transition name="fade">
									<span v-if="meta.validated && !meta.valid" class="text-red-700"> ({{ meta.errors[0] || "Er is een probleem met dit veld" }}) </span>
								</transition>
							</label>
							<div class="flex gap-2">
								<textarea :disabled="!content?.permision?.edit || loading" v-bind="field" placeholder="Describe what your group is about!" id="description" :value="description" type="text" :class="meta.validated && !meta.valid ? ' btn-Input-Error' : 'btn-Input'" class="z-10 w-full p-2 px-3 transition-colors duration-300 border appearance-none resize-none disabled:bg-gray-50 max-h-24 min-h-24 rounded-xl"></textarea>
							</div>
						</div>
					</field>
				</Form>
			</div>

			<div class="p-4 border rounded-xl">
				<div class="flex items-center justify-between mb-1">
					<h1 class="font-bold">Members</h1>
				</div>

				<p class="mb-3 text-sm text-gray-500">List with active group members</p>
				<hr class="mt-3 mb-3" />

				<div class="-mt-2 overflow-x-auto">
					<div  class="">
						<div v-if="!searchLoading" v-for="member in memberList" :key="member.id" class="w-full gap-4 p-2 border-b border-gray-100 min-h-16 hover:bg-gray-50">
							<div class="flex items-center gap-4">
								<img :src="member.avatar || '/profile.jpg'" class="rounded-full w-11 h-11" />
								<div class="w-full pl-3 border-l border-gray-100">
									<div class="flex items-center justify-between w-full">
										<div>
											<h1 class="text-sm font-bold">{{ member?.name }}</h1>
											<p v-if="member?.Permissions?.can_delete_group" class="text-sm text-gray-500">Admin</p>
											<p v-else-if="member?.Permissions?.can_delete_messages_all" class="text-sm text-gray-500">Moderator</p>
											<p v-else class="text-sm text-gray-500 text">Member</p>
										</div>
										<div v-if="content?.permision?.change" class="flex items-center gap-2">
											<button :class="member?.name?.includes('(You)') || member?.Permissions?.can_delete_group || !content.permision.change ? 'opacity-50 cursor-not-allowed' : ''" :disabled="member?.name.includes('(You)') || member?.Permissions?.can_delete_group || !content?.permision?.change" class="flex items-center justify-center p-1">
												<Icon name="ri:settings-2-line" size="1.3rem" />
											</button>
											<button @click="KickMember(member?.id)" :class="member?.name.includes('(You)') || member?.Permissions?.can_delete_group || !content.permision.edit ? 'opacity-50 cursor-not-allowed' : 'text-red-500 hover:text-red-700'" :disabled="member?.name.includes('(You)') || member?.Permissions?.can_delete_group || !content?.permision?.edit" class="flex items-center justify-center p-1">
												<Icon name="ri:delete-bin-2-line" size="1.3rem" />
											</button>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div v-else class="flex justify-center w-full h-full gap-2 p-4 text-gray-500 items">
							<icon class="text-gray-500 animate-spin" name="ri:loader-2-line" size="1.2em" />
							<p class="text-sm"> Searching...</p>
						</div>
						<div v-if="memberList.length === 0" class="flex justify-center w-full h-full p-4 text-gray-500 items">
							<p class="text-sm">No members found</p>
						</div>
					</div>
				</div>
			</div>

			<div class="p-4 border rounded-xl">
				<div class="flex items-center justify-between mb-1">
					<h1 class="font-bold">Invite links</h1>
				</div>

				<p class="mb-3 text-sm text-gray-500">List with all invite links that have been created</p>

				<hr class="mb-1" />

				<div class="overflow-x-auto">
					<table class="w-full overflow-hidden text-sm border-collapse">
						<tbody>
							<tr v-for="link in inviteLinks" :key="link.id" class="transition-all border-b border-gray-100 hover:bg-gray-50">
								<td class="p-3 text-left">
									<button @click="share(link)" :class="isLinkExpired(link) || getRemainingUses(link) === 0 ? ' opacity-50' : ' underline'" class="truncate max-w-[150px] overflow-auto font-black">{{ link.code }}</button>
								</td>
								<td class="p-3 text-center text-gray-800">
									<div v-if="isLinkExpired(link) === null">
										<Icon name="ri:infinity-line" size="1.3rem" />
									</div>
									<span v-else-if="isLinkExpired(link)" class="px-2 py-1 ml-2 text-xs font-semibold text-red-600 bg-red-100 rounded">Expired</span>

									<span v-else>{{ useDateFormat(link.expiresAt, "MMM-DD HH:mm") }}</span>
								</td>
								<td class="p-3 font-semibold text-center text-gray-600">
									<div v-if="getRemainingUses(link) === null">
										<Icon name="ri:infinity-line" size="1.3rem" />
									</div>
									<span v-else-if="getRemainingUses(link) === 0" class="px-2 py-1 ml-2 text-xs font-semibold text-red-600 bg-red-100 rounded">Used</span>

									<span v-else>{{ getRemainingUses(link) }}</span>
								</td>
								<td class="flex justify-center gap-2 p-3 text-center">
									<button :class="!link?.permision?.delete ? ' opacity-50' : 'text-red-500 hover:text-red-700'" :disabled="!link?.permision?.delete" @click="handleDeleteInviteLink(link)" class="transition">
										<Icon name="ri:delete-bin-2-line" size="1.3rem" />
									</button>
								</td>
							</tr>
							<tr v-if="inviteLinks.length === 0">
								<td colspan="4" class="py-6 text-center text-gray-500">No invite links created yet</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>

			<div class="p-4 mb-2 border rounded-xl">
				<div class="">
					<div v-for="(section, index) in config.sections" :key="index">
						<h1 class="mb-1 font-bold" :class="{ 'mt-4': index > 0 }">{{ section.title }}</h1>
						<p v-if="index == 0" class="mb-3 text-sm text-gray-500">Additional group setting that can be changed</p>

						<hr class="my-3" />
						<div class="grid items-center gap-2">
							<div v-for="option in section.options" :key="option.key" class="flex items-center justify-between">
								<p>{{ option.label }}</p>
								<label class="cursor-pointer">
									<input :disabled="!content?.permision?.change || loading" type="checkbox" v-model="option.value" class="sr-only" />
									<div class="w-12 h-6 p-1 transition duration-300 bg-gray-200 rounded-full" :class="{ ' bg-yellow-800': option.value && content?.permision?.edit && !loading, 'bg-gray-300 cursor-not-allowed': (!content?.permision?.edit || loading) && !option.value, 'bg-yellow-900 cursor-not-allowed': option.value && (!content?.permision?.edit || loading) }">
										<div class="w-4 h-4 mt-[0.020rem] transition duration-300 transform bg-white rounded-full shadow-md" :class="{ 'translate-x-6': option.value }"></div>
									</div>
								</label>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
<script setup lang="ts">
	import { toTypedSchema } from "@vee-validate/zod";
	import * as zod from "zod";

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

	const group_id = useRoute().params.group_id;

	const button = templateRef("hidden");
	const clickButton = () => button.value.click();

	const { PWAInstalled } = inject<any>("PWA");
	const { addToast } = useToast();

	/*
	 ************************************************************************************
	 */

	const share = (link: any) => {
		if (isLinkExpired(link) || getRemainingUses(link) === 0) return addToast({
			message: `The invitation link has already expired: ${link.code}`,
			type: "error",
			duration: 5000,
		});

		const dummy = document.createElement("input");
		const text = `${window.location.host}/invitations/${link.id}?token=${link.code}`;
		dummy.style.opacity = "0";
		dummy.style.position = "absolute";
		dummy.style.top = "0";

		document.body.appendChild(dummy);
		dummy.value = text;
		dummy.select();
		document.execCommand("copy");
		document.body.removeChild(dummy);

		addToast({
			message: `The invitation link has been copied: ${link.code}`,
			type: "info",
			duration: 5000,
		});
	};

	/*
	 ************************************************************************************
	 */
	const CreateLink = async () => createInviteFunction();
	const leaveGroup = async () => createLeaveFunction();
	const KickMember = async (id: string) => createKickFunction(id);
	const deleteData = async () => createDeleteFunction();

	/*
	 ************************************************************************************
	 */

	const searchLoading = ref(false);

	const handleSearch = (data: any, error: any, loading: boolean) => {
		searchLoading.value = loading;

		if(data.value) memberList.value = data.value.data;

		if (error.value) {
			memberList.value = [];
			addToast({
				message: `An error occurred while searching. Please try again later.`,
				type: "error",
				duration: 5000,
			});
		}
	};

	/*
	 ************************************************************************************
	 */

	const isLinkExpired = (link: any) => {
		if (link.expiresAt === null) return link.expiresAt;
		return new Date(link.expiresAt) < new Date();
	};
	const getRemainingUses = (link: any) => link.uses;

	const handleDeleteInviteLink = async (invite: any) => {
		await $fetch(`/api/moments/invitations/${group_id}/${invite.id}`, { method: "delete" })
			.then(() => {
				inviteLinks.value = inviteLinks.value.filter((link: any) => link.id !== invite.id);
				addToast({
					message: `The invitation link has been deleted: ${invite.code}`,
					type: "success",
					duration: 5000,
				});
			})
			.catch((error) => {});
	};

	/*
	 ************************************************************************************
	 */
	const content = ref();
	const config = ref();

	const { value: name }: any = useField<string>("name");
	const { value: description }: any = useField<string>("description");

	const inviteLinks: any = ref([]);
	const memberList: any = ref([]);

	const { makeRequest, data, error } = useRetryableFetch<ApiResponse<any>>();

	await makeRequest(`/api/moments/settings/${group_id}`)
	if(data.value) {
		content.value = data.value.data;
		name.value = data.value.data.name;
		config.value = data.value.data.configuration;
		description.value = data.value.data.description;
	}

	await makeRequest(`/api/moments/invitations/${group_id}`)
	if(data.value) inviteLinks.value = data.value.data;
	
	await makeRequest(`/api/moments/members/${group_id}`)
	if(data.value) memberList.value = data.value.data;

	/*
	 ************************************************************************************
	 */

	const { updateModalValue } = inject<any>("modal");

	const createDeleteFunction = () => {
		updateModalValue({
			open: true,
			type: "negative:group",
			name: "Alert",
			requestUrl: `/api/moments/${group_id}`,
			onSuccess: handleSuccess,
			onError: handleError,
		});
	};

	const handleSuccess = async ({ response }: SuccessResponse<null>) => {
		if (response.status.redirect) {
			setTimeout(() => navigateTo(response.status.redirect), 500);

			setTimeout(() => {
				addToast({
					message: `You have deleted the group`,
					type: "success",
					duration: 5000,
				});
			}, 800);
		}
	};

	const handleError = async ({ error, actions }: ErrorResponse) => {
		actions.setErrors({ message: ["An error occurred, unable to delete the group! Please try again later."] });
	};

	/*
	 ************************************************************************************
	 */
	const createInviteFunction = () => {
		updateModalValue({
			open: true,
			type: "links",
			name: "Generate",
			requestUrl: `/api/moments/invitations/${group_id}`,
			onSuccess: handleInviteSuccess,
			onError: handleInviteError,
		});
	};

	const handleInviteSuccess = async ({ response: main }: any) => {
		if (main.status.refresh)
			await $fetch(`/api/moments/invitations/${group_id}`)
				.then((response: any) => {
					inviteLinks.value = response.data;

					setTimeout(() => {
						addToast({
							message: `Invitation link has been created: ${main.data.code}`,
							type: "success",
							duration: 5000,
						});
					}, 500);
				})
				.catch((error) => {});
	};

	const handleInviteError = async ({ error, actions }: ErrorResponse) => {
		actions.setErrors({ message: ["An error occurred, unable to join the group! Please try again later."] });
	};

	/*
	 ************************************************************************************
	 */

	const createLeaveFunction = () => {
		updateModalValue({
			open: true,
			type: "Group:leave",
			name: "Alert",
			requestUrl: `/api/moments/members/${group_id}`,
			onSuccess: handleLeaveSuccess,
			onError: handleLeaveError,
		});
	};

	const handleLeaveSuccess = async ({ response }: any) => {
		if (response.status.redirect) navigateTo(response.status.redirect);

		setTimeout(() => {
			addToast({
				message: `You have left the group`,
				type: "success",
				duration: 5000,
			});
		}, 500);
	};

	const handleLeaveError = async ({ error, actions }: ErrorResponse) => {
		actions.setErrors({ message: ["An error occurred, unable to leave the group! Please try again later."] });
		addToast({
			message: `An error occurred, unable to leave the group`,
			type: "error",
			duration: 5000,
		});
	};

	/*
	 ************************************************************************************
	 */

	const createKickFunction = (id: string) => {
		updateModalValue({
			open: true,
			type: "Group:kick",
			name: "Alert",
			requestUrl: `/api/moments/members/${group_id}/${id}`,
			onSuccess: handleKickSuccess,
			onError: handleKickError,
		});
	};

	const handleKickSuccess = async ({ response }: any) => {
		await $fetch(`/api/moments/members/${group_id}`)
			.then((response: any) => {
				memberList.value = response.data;

				setTimeout(() => {
					addToast({
						message: `Member has been removed from the group`,
						type: "success",
						duration: 5000,
					});
				}, 500);
			})
			.catch((error) => {});
	};

	const handleKickError = async ({ error, actions }: ErrorResponse) => {
		actions.setErrors({ message: ["An error occurred, unable to kick the member! Please try again later."] });
		addToast({
			message: `An error occurred, unable to kick the member`,
			type: "error",
			duration: 5000,
		});
	};

	/*
	 ************************************************************************************
	 */

	const loading = ref(false);

	const schema = toTypedSchema(
		zod.object({
			name: zod.string({ message: "This field is required" }).nonempty({ message: "This field is required" }),
			description: zod.string({ message: "This field is required" }).nonempty({ message: "This field is required" }),
		})
	);

	const handleSubmit = async (values: Record<string, any>, actions: Record<string, any>) => {
		loading.value = true;

		await new Promise((resolve) => setTimeout(resolve, 2000));

		values.configuration = {};

		config.value.sections.forEach((section: any) => {
			section.options.forEach((option: any) => {
				values.configuration[option.key] = option.value;
			});
		});

		await $fetch(`/api/moments/${content.value.id}`, { method: "PATCH", body: values })
			.then(async (response: any) => {
				if (response.status.refresh)
					await $fetch(`/api/moments/settings/${group_id}`)
						.then((response) => {
							content.value = response.data;
							name.value = response.data.name;
							config.value = response.data.configuration;
							description.value = response.data.description;

							addToast({
								message: `Group settings have been updated`,
								type: "success",
								duration: 5000,
							});
						})
						.catch((error) => {
							throw createError({
								statusCode: error.data.meta.code,
								message: error.data.meta.message,
								fatal: true,
							});
						});
			})
			.catch(async (error) => {
				await new Promise((resolve) => setTimeout(resolve, 1000));
				if (error.data && error.data.error?.type == "fields") actions.setErrors(error.data.error.details);
			})
			.finally(() => (loading.value = false));
	};
</script>

<style scoped>
	.fade-enter-active,
	.fade-leave-active {
		transition: opacity 0.3s ease;
	}
	.fade-enter-from,
	.fade-leave-to {
		opacity: 0;
	}
</style>
