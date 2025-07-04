<template>
	<div>
		<div>
			<div class="sticky z-50 pt-3 -mt-5 bg-white -top-4 sm:mt-2 md:-mt-5 ">
				<div class="flex items-center justify-between w-full gap-2 mb-3 md:justify-end">
					<FieldInputSearch v-if="content?.accepted" class="hidden md:flex" placeholder="Search member..." :disabled="!content?.accepted" :update="handleSearch" :uri="`/api/moments/members/${group_id}?pending=${activeTab == 'requests'}`" />
					<NuxtLink v-if="content?.permision?.edit" aria-label="logbook" :to="`/moments/logbook/${group_id}`" class="flex w-fit items-center justify-center gap-2 p-2 px-2 text-sm text-[#756145] hover:bg-gray-50 border border-[#756145] rounded-xl">
						<Icon name="ri:book-marked-fill" size="1.4rem" />
					</NuxtLink>
					<button v-if="content?.permision?.create && content?.accepted" id="CreateLink" title="CreateLink" @click="CreateLink" :disabled="loading" class="flex w-fit items-center justify-center gap-2 p-2 px-2 text-sm text-[#756145] hover:bg-gray-50 border border-[#756145] rounded-xl">
						<Icon name="ri:attachment-2" size="1.4rem" />
					</button>
					<button :disabled="loading" id="updateSettings" title="updateSettings" @click="clickButton" v-if="content?.permision?.change" class="flex w-full md:w-44 items-center justify-center gap-2 p-2 px-3 text-sm text-white bg-[#756145] border border-[#756145] rounded-xl">
						<icon v-if="loading" class="animate-spin" size="1.25rem" name="ri:refresh-line" />
						<span v-else> Update group</span>
					</button>
					<button v-if="content?.permision?.delete" id="deleteGroup" title="deleteGroup" @click="deleteData" class="flex w-full md:w-44 items-center justify-center gap-2 p-2 px-2 text-sm text-white bg-[#756145] border border-[#756145] rounded-xl">Delete group</button>
					<button v-else id="leaveGroup" title="leaveGroup" @click="leaveGroup" class="flex w-full md:w-44 items-center justify-center gap-2 p-2 px-2 text-sm text-white bg-[#756145] border border-[#756145] rounded-xl">Leave group<span class="hidden md:flex"></span></button>
				</div>
				<FieldInputSearch v-if="content?.accepted" class="md:hidden" placeholder="Search member..." :disabled="!content.accepted" :update="handleSearch" :uri="`/api/moments/members/${group_id}?pending=${activeTab == 'requests'}`" />
				<hr class="pb-3 mt-3" />
			</div>

			<div :class="PWAInstalled ? 'pb-32' : 'pb-20'" class="flex flex-col gap-4 overflow-scroll">
				<div v-if="content?.permision?.change" class="p-4 border rounded-xl">
					<Form :validation-schema="schema" @submit="handleSubmit">
						<div class="flex items-center justify-between mb-1">
							<h1 class="font-bold">Group details</h1>
							<button ref="hidden" id="hidden" title="hidden" :disabled="loading" v-if="content?.permision?.edit" class="sr-only"></button>
						</div>
						<p class="mb-3 text-sm text-gray-500">Update the group information.</p>

						<hr class="mb-2" />

						<field name="name" v-slot="{ field, meta }: any" v-model="name">
							<div class="space-y-2">
								<label class="text-sm font-medium text-gray-700" for="name">
									Group name
									<transition name="fade">
										<span v-if="meta.validated && !meta.valid" class="text-red-700">({{ meta.errors[0] || "There is a problem with this field." }})</span>
									</transition>
								</label>

								<div class="flex gap-2">
									<input :disabled="loading" placeholder="Enter a unique and catchy name!" v-bind="field" id="name" :value="name" type="text" ref="nameData" :class="meta.validated && !meta.valid ? ' btn-Input-Error' : 'btn-Input'" class="z-10 w-full p-2 px-3 transition-colors duration-300 border appearance-none disabled:bg-gray-50 rounded-xl" />
								</div>
							</div>
						</field>

						<field name="description" v-slot="{ field, meta }: any" v-model="description">
							<div class="mt-1 space-y-2">
								<label class="text-sm font-medium text-gray-700" for="description">
									Description
									<transition name="fade">
										<span v-if="meta.validated && !meta.valid" class="text-red-700"> ({{ meta.errors[0] || "There is a problem with this field." }}) </span>
									</transition>
								</label>
								<div class="flex gap-2">
									<textarea :disabled="loading" v-bind="field" placeholder="Describe what your group is about!" id="description" :value="description" type="text" :class="meta.validated && !meta.valid ? ' btn-Input-Error' : 'btn-Input'" class="z-10 w-full p-2 px-3 transition-colors duration-300 border appearance-none resize-none disabled:bg-gray-50 max-h-24 min-h-24 rounded-xl"></textarea>
								</div>
							</div>
						</field>
					</Form>
				</div>

				<div class="p-4 border rounded-xl">
					<div class="flex items-center justify-between -mb-1">
						<h1 class="font-bold">Members</h1>
						<button @click="setActiveTab(activeTab)" id="reloadMembers" title="reloadMembers" :disabled="searchLoading" class="flex items-center justify-center p-2 px-2 text-white bg-[#756145] border border-[#756145] rounded-xl w-fit">
							<icon :class="searchLoading ? ' animate-spin' : ''" name="ri:refresh-line" size="1.1em" />
						</button>
					</div>
					<p v-if="activeTab == 'members'" class="mb-3 text-sm text-gray-500">List with active group members</p>
					<p v-else class="mb-3 text-sm text-gray-500">List with active invite requests</p>

					<div v-if="content?.accepted" class="flex items-center gap-2 justify-evenly p-[0.20rem] border rounded-xl w-full overflow-hidden bg-gray-100">
						<button :disabled="searchLoading" @click="setActiveTab('members')" :class="activeTab == 'members' ? 'bg-white font-bold' : ''" class="flex items-center justify-center w-full p-1 rounded-lg">
							<span class="text-xs">Members</span>
						</button>
						<span class="text-sm text-gray-400">|</span>
						<button :disabled="searchLoading" @click="setActiveTab('requests')" :class="activeTab == 'requests' ? 'bg-white font-bold' : ''" class="flex items-center justify-center w-full py-1 rounded-lg">
							<span class="text-xs">Requests</span>
						</button>
					</div>
					<hr class="mt-3 mb-3" />
					<div class="-mt-2 overflow-x-auto">
						<div class="">
							<div v-if="!searchLoading" v-for="member in memberList" :key="member.id" class="w-full gap-4 p-2 border-b border-gray-100 min-h-16 hover:bg-gray-50">
								<div class="flex items-center gap-4">
									<img :src="member.avatar || '/profile.jpg'" :alt="member.name" class="rounded-full w-11 h-11" />
									<div class="w-full pl-3 border-l border-gray-100">
										<div class="flex items-center justify-between w-full">
											<div>
												<h1 class="text-sm font-bold">{{ member?.name }}</h1>
												<p v-if="member?.Permissions?.can_delete_group" class="text-sm text-gray-500">Owner</p>
												<p v-else-if="member?.Permissions?.can_edit_group" class="text-sm text-gray-500">Admin</p>
												<p v-else-if="member?.Permissions?.can_delete_messages_all" class="text-sm text-gray-500 text">Moderator</p>
												<p v-else-if="member?.accepted" class="text-sm text-gray-500 text">Member</p>
												<p v-else class="text-sm text-gray-500 text">Pending</p>
											</div>
											<div v-if="content?.permision?.change" class="flex items-center gap-2">
												<button id="updateMembers" title="updateMembers" v-if="member?.accepted" @click="createUpdateFunction(member?.id)" :class="member?.name?.includes('(You)') || member?.Permissions?.can_delete_group || !content.permision.change ? 'opacity-30 cursor-not-allowed' : ''" :disabled="member?.name.includes('(You)') || member?.Permissions?.can_delete_group || !content?.permision?.change" class="flex items-center justify-center p-1 text-black/70 hover:text-black">
													<Icon name="ri:edit-circle-line" size="1.3rem" />
												</button>
												<button v-else id="acceptMember" title="acceptMember" @click="AcceptMember(member?.id)" :class="member?.name.includes('(You)') || member?.Permissions?.can_delete_group || !content.permision.edit ? 'opacity-30 cursor-not-allowed' : 'text-green-500 hover:text-green-700'" :disabled="member?.name.includes('(You)') || member?.Permissions?.can_delete_group || !content?.permision?.edit" class="flex items-center justify-center p-1">
													<Icon name="ri:checkbox-circle-line" size="1.3rem" />
												</button>
												<button id="kickMember" title="kickMember" v-if="member?.accepted" @click="KickMember(member?.id)" :class="member?.name.includes('(You)') || member?.Permissions?.can_delete_group || !content.permision.edit ? 'opacity-30 cursor-not-allowed' : 'text-red-500 hover:text-red-700'" :disabled="member?.name.includes('(You)') || member?.Permissions?.can_delete_group || !content?.permision?.edit" class="flex items-center justify-center p-1">
													<Icon name="ri:close-circle-line" size="1.3rem" />
												</button>
												<button id="rejectMember" title="rejectMember" v-else @click="RejectMember(member?.id)" :class="member?.name.includes('(You)') || member?.Permissions?.can_delete_group || !content.permision.edit ? 'opacity-30 cursor-not-allowed' : 'text-red-500 hover:text-red-700'" :disabled="member?.name.includes('(You)') || member?.Permissions?.can_delete_group || !content?.permision?.edit" class="flex items-center justify-center p-1">
													<Icon name="ri:indeterminate-circle-line" size="1.3rem" />
												</button>
											</div>
										</div>
									</div>
								</div>
							</div>
							<div v-else v-for="i in 2" :key="i" class="w-full gap-4 p-2 border-b border-gray-100 min-h-16 hover:bg-gray-50">
								<div class="flex items-center gap-4 animate-pulse">
									<div class="flex items-center justify-center bg-gray-200 rounded-full w-11 h-11">
										<icon class="text-gray-500 animate-spin" name="ri:loader-2-line" size="1.2em" />
									</div>
									<div class="pl-3 border-l border-gray-100 w-fit">
										<div class="flex items-center justify-between w-full">
											<div>
												<div class="w-32 h-4 mb-[0.32rem] rounded bg-gray-300"></div>
												<div class="w-20 h-3 bg-gray-200 rounded"></div>
											</div>
										</div>
									</div>
								</div>
							</div>
							<div v-if="memberList.length === 0 && !searchLoading" class="flex justify-center w-full h-full p-4 text-gray-500 items">
								<p v-if="activeTab == 'requests'" class="text-sm">No invite requests found</p>
								<p v-else class="text-sm">No members found</p>
							</div>
						</div>
					</div>
				</div>

				<div v-if="content?.accepted" class="p-4 border rounded-xl">
					<div class="flex items-center justify-between -mb-1">
						<h1 class="font-bold">Invite links</h1>
						<button @click="reloadInvite" :disabled="InviteLoading" class="flex items-center justify-center p-2 px-2 text-white bg-[#756145] border border-[#756145] rounded-xl w-fit">
							<icon :class="InviteLoading ? ' animate-spin' : ''" name="ri:refresh-line" size="1.1em" />
						</button>
					</div>

					<p class="mb-3 text-sm text-gray-500">All invite links that have been created</p>

					<hr class="mb-1" />

					<div class="overflow-x-auto">
						<table class="w-full overflow-hidden text-sm border-collapse">
							<tbody>
								<tr v-if="!InviteLoading" v-for="link in inviteLinks" :key="link.id" class="transition-all border-b border-gray-100 hover:bg-gray-50">
									<td class="p-3 text-left">
										<button @click="share(link)" :class="isLinkExpired(link) || getRemainingUses(link) === 0 ? ' opacity-50' : ' underline'" class="truncate max-w-[150px] overflow-auto font-black">{{ link.code }}</button>
									</td>
									<td class="p-3 text-center text-gray-800">
										<div v-if="isLinkExpired(link) === null">
											<Icon name="ri:infinity-line" size="1.3rem" />
										</div>
										<span v-else-if="isLinkExpired(link)" class="px-2 py-1 ml-2 text-xs font-semibold text-red-600 bg-red-100 rounded">Expired</span>

										<span v-else>{{ useDateFormat(link.expiresAt || "", "DD-MM HH:mm") }}</span>
									</td>
									<td class="p-3 font-semibold text-center text-gray-600">
										<div v-if="getRemainingUses(link) === null">
											<Icon name="ri:infinity-line" size="1.3rem" />
										</div>
										<span v-else-if="getRemainingUses(link) === 0" class="px-2 py-1 ml-2 text-xs font-semibold text-red-600 bg-red-100 rounded">Used</span>

										<span v-else>{{ getRemainingUses(link) }}</span>
									</td>
									<td class="flex justify-center gap-2 p-3 text-center">
										<button :class="!link?.permision?.delete ? ' opacity-30' : 'text-red-500 hover:text-red-700'" :disabled="!link?.permision?.delete" @click="handleDeleteInviteLink(link)" class="transition">
											<Icon name="ri:close-circle-line" size="1.3rem" />
										</button>
									</td>
								</tr>
								<tr v-if="inviteLinks.length === 0 && !InviteLoading">
									<td colspan="4" class="py-6 text-center text-gray-500">No invite links created yet</td>
								</tr>
								<tr v-else-if="InviteLoading">
									<td colspan="4" class="py-6 text-center text-gray-500">
										<span class="flex items-center justify-center gap-2">
											<icon class="text-gray-500 animate-spin" name="ri:loader-2-line" size="1.2em" />
											<p class="text-sm">loading all invites...</p>
										</span>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>

				<div v-if="content?.permision?.change" class="p-4 mb-2 border rounded-xl">
					<div class="">
						<div v-for="(section, index) in config.sections" :key="index">
							<h1 class="mb-1 font-bold" :class="{ 'mt-4': index > 0 }">{{ section.title }}</h1>
							<p v-if="index == 0" class="mb-3 text-sm text-gray-500">Additional group setting that can be changed</p>

							<hr class="my-3" />
							<div class="grid items-center gap-2">
								<div v-for="option in section.options" :key="option.key" class="flex items-center justify-between">
									<p>{{ option.label }}</p>
									<label :for="option.key" class="cursor-pointer">
										<input :disabled="!content?.permision?.change || loading" type="checkbox" :name="option.key" :id="option.key" :aria-labelledby="option.key" v-model="option.value" class="sr-only" />
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
		title: "Lumora - Group settings",
		description: "Manage your group details, privacy settings, and member access on Lumora.",
		ogTitle: "Lumora - Customize Your Group",
		ogDescription: "Edit your group name, description, visibility, and more. Keep your photo group exactly how you want it.",
		ogImage: "/apple-touch-icon.png",
		ogUrl: "/",
		twitterTitle: "Lumora - Group Settings",
		twitterDescription: "Update your group settings and manage members easily on Lumora.",
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

	const share = (link: InviteLink) => {
		if (isLinkExpired(link) || getRemainingUses(link) === 0)
			return addToast({
				message: `The invitation link has already expired: ${link.code}`,
				type: "error",
				duration: 5000,
			});

		const dummy = document.createElement("input");

		const text = `${window.location.origin}/invitations/${link.id}?token=${link.code}`;
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
	const AcceptMember = async (id: string) => createAcceptFunction(id);
	const RejectMember = async (id: string) => createRejectFunction(id);

	/*
	 ************************************************************************************
	 */

	const searchLoading = ref(true);
	const InviteLoading = ref(true);

	const handleSearch = (data: Ref<ApiResponse<GroupMember[]>>, error: Ref<ErrorResponse>, loading: boolean) => {
		searchLoading.value = loading;
		memberList.value = [];

		if (!searchLoading.value) {
			if (data.value?.data.length <= 0 || error.value)
				return addToast({
					message: `An error occurred while searching. unable to find member.`,
					type: "error",
					duration: 5000,
				});

			memberList.value = data.value.data;
		}
	};

	/*
	 ************************************************************************************
	 */

	const isLinkExpired = (link: InviteLink) => {
		if (link.expiresAt === null) return link.expiresAt;
		return new Date(link.expiresAt) < new Date();
	};
	const getRemainingUses = (link: InviteLink) => link.uses;

	const handleDeleteInviteLink = async (invite: InviteLink) => {
		const { success } = await invites.update({
			url: invite.id,
			params: { token: invite.code },
			method: "DELETE",
		});

		await invites.reload();

		if (success)
			return addToast({
				message: `The invitation link has been deleted: ${invite.code}`,
				type: "success",
				duration: 5000,
			});

		addToast({
			message: `An error occurred, unable to delete invitation link`,
			type: "error",
			duration: 5000,
		});
	};

	/*
	 ************************************************************************************
	 */

	const originalName = ref("");
	const originalDescription = ref("");
	const originalConfig = ref<Record<string, boolean>>({});

	const inviteLinks = ref<InviteLink[]>([]);
	const memberList = ref<GroupMember[]>([]);

	const activeTab = ref("members");

	const setActiveTab = async (tab: string) => {
		searchLoading.value = true;
		activeTab.value = tab;

		await members.reload({
			params: { pending: tab == "requests" },
		});

		setTimeout(() => {
			searchLoading.value = false;
		}, 1500);
	};

	const reloadInvite = async () => {
		InviteLoading.value = true;
		await invites.reload();
		setTimeout(() => (InviteLoading.value = false), 1500);
	};

	/*
	 ************************************************************************************
	 */

	const { makeRequest } = useRetryableFetch({ throwOnError: false });
	const { updateGroupValue } = inject<any>("group");
	const abortController = new AbortController();

	const settings = useApi<GroupSettings>();
	const members = useApi<GroupMember[]>();
	const invites = useApi<InviteLink[]>();

	const content = ref();
	const config = ref();

	const { value: name } = useField<string>("name");
	const { value: description } = useField<string>("description");

	/*
	 ************************************************************************************
	 */

	settings.prepare({
		baseURL: `/api/moments/settings/${group_id}`,
		onSuccess: ({ response }) => {
			content.value = response.data;
			name.value = response.data.name;
			description.value = response.data.description;
			config.value = response.data.configuration;

			originalName.value = response.data.name;
			originalDescription.value = response.data.description;

			response.data.configuration.sections.forEach((section) => {
				section.options.forEach((option) => {
					originalConfig.value[option.key] = option.value;
				});
			});

			updateGroupValue(name.value);
		},
		onError: ({ error, updated }) => {
			if (!updated) useThrowError(error);
		},
	});

	members.prepare({
		baseURL: `/api/moments/members/${group_id}?pending=${activeTab.value == "requests"}`,
		options: { signal: abortController.signal },
		onSuccess: ({ response }) => (memberList.value = response.data),
		onError: () => (memberList.value = []),
	});

	invites.prepare({
		baseURL: `/api/moments/invitations/${group_id}`,
		options: { signal: abortController.signal },
		onSuccess: ({ response }) => (inviteLinks.value = response.data),
		onError: ({ error, updated }) => {
			if (!updated) inviteLinks.value = [];
		},
	});

	/*
	 ************************************************************************************
	 */

	await settings.load();

	setTimeout(async () => {
		await members.load();
		await invites.load();

		searchLoading.value = false;
		InviteLoading.value = false;
	}, 2500);

	/*
	 ************************************************************************************
	 */

	const webSocket = inject<any>("WebSocket");

	const { open } = useModal();

	const createDeleteFunction = () => {
		const { onSuccess } = open({
			type: "negative:group",
			name: "Alert",
			url: `/api/moments/${group_id}`,
		});

		onSuccess(async () => {
			webSocket.send(
				JSON.stringify({
					type: "delete",
					group_id,
				})
			);

			addToast({
				message: `You have deleted the group`,
				type: "success",
				duration: 5000,
			});
		});
	};

	/*
	 ************************************************************************************
	 */

	const createInviteFunction = () => {
		const { onSuccess } = open<InviteLink>({
			type: "links",
			name: "Generate",
			url: `/api/moments/invitations/${group_id}`,
		});

		onSuccess(async ({ response }) => {
			const { success } = await invites.reload();
			if (success)
				return addToast({
					message: `Invitation link has been created: ${response.data.code}`,
					type: "success",
					duration: 5000,
				});
		});
	};

	/*
	 ************************************************************************************
	 */

	const createLeaveFunction = () => {
		const { onSuccess, onError } = open({
			type: "Group:leave",
			name: "Alert",
			url: `/api/moments/members/${group_id}`,
		});

		onSuccess(async ({ response }) => {
			if (response.status.redirect) navigateTo(response.status.redirect);
			webSocket.send(
				JSON.stringify({
					type: "update-topics",
				})
			);

			addToast({
				message: `You have left the group`,
				type: "success",
				duration: 5000,
			});
		});

		onError(async () =>
			addToast({
				message: `An error occurred, unable to leave the group`,
				type: "error",
				duration: 5000,
			})
		);
	};

	/*
	 ************************************************************************************
	 */

	const member_id = ref();

	const createRejectFunction = (id: string) => {
		member_id.value = id;

		const { onSuccess, onError } = open({
			type: "Group:Reject",
			name: "Alert",
			url: `/api/moments/members/${group_id}/${id}`,
		});

		onSuccess(async () => {
			const { success } = await members.reload();

			if (success) {
				webSocket.send(
					JSON.stringify({
						type: "kick",
						group_id,
						member_id: member_id.value,
					})
				);

				addToast({
					message: `Member has been rejected to join the group`,
					type: "success",
					duration: 5000,
				});
			}
		});

		onError(async () =>
			addToast({
				message: `An error occurred, unable to reject the member`,
				type: "error",
				duration: 5000,
			})
		);
	};

	/*
	 ************************************************************************************
	 */

	const createKickFunction = (id: string) => {
		member_id.value = id;

		const { onSuccess, onError } = open({
			type: "Group:kick",
			name: "Alert",
			url: `/api/moments/members/${group_id}/${id}`,
		});

		onSuccess(async () => {
			const { success } = await members.reload();

			if (success) {
				webSocket.send(
					JSON.stringify({
						type: "kick",
						group_id,
						member_id: member_id.value,
					})
				);

				addToast({
					message: `Member has been kicked from the group`,
					type: "success",
					duration: 5000,
				});
			}
		});

		onError(async () =>
			addToast({
				message: `An error occurred, unable to kick the member`,
				type: "error",
				duration: 5000,
			})
		);
	};

	// /*
	//  ************************************************************************************
	//  */

	const createAcceptFunction = (id: string) => {
		const { onSuccess, onError } = open({
			type: "join:group",
			name: "join",
			url: `/api/moments/members/${group_id}/${id}`,
		});

		onSuccess(async () => {
			const { success } = await members.reload();

			if (success) {
				webSocket.send(
					JSON.stringify({
						type: "update-topics",
					})
				);

				addToast({
					message: `Member has been accepted to the group`,
					type: "success",
					duration: 5000,
				});
			}
		});

		onError(async () =>
			addToast({
				message: `An error occurred, unable to accept the member`,
				type: "error",
				duration: 5000,
			})
		);
	};

	/*
	 ************************************************************************************
	 */

	const createUpdateFunction = async (id: string) => {
		
		const { makeRequest } = useRetryableFetch({ throwOnError: false });
		
		const url = `/api/moments/members/permissions/${group_id}/${id}`
		const { data, error } = await makeRequest<any>(url);

		if(data.value) {
		
			const { onSuccess, onError } = open({
				type: "update:member",
				name: "Edit Permissions",
				url: url,
				details: data.value
			});

			onSuccess(async () => {
				searchLoading.value = true;

				const { success } = await members.reload();

				if (success) {
					webSocket.send(
						JSON.stringify({
							type: "update-topics",
						})
					);

					addToast({
						message: `Member permissions updated`,
						type: "success",
						duration: 5000,
					});
				}

				setTimeout(() => (searchLoading.value = false), 1500);
			});

			onError(async () =>
				addToast({
					message: `An error occurred, unable to update the member`,
					type: "error",
					duration: 5000,
				})
			);
		}

		if(error.value) addToast({
			message: "An error occurred, unable to get the user",
			type: "error",
			duration: 5000
		})

	};

	/*
	 ************************************************************************************
	 */
	const blocked = ref(false);

	function getOriginalOptionsMap() {
		const map: Record<string, any> = {};
		for (const section of config.value.sections) {
			for (const option of section.options) {
				if (originalConfig.value[option.key] !== undefined) {
					map[option.key] = originalConfig.value[option.key];
				}
			}
		}
		return map;
	}

	function isConfigChanged() {
		const originalMap = getOriginalOptionsMap();
		for (const section of config.value.sections) {
			for (const option of section.options) {
				if (originalMap[option.key] !== option.value) {
					return true;
				}
			}
		}
		return false;
	}

	watch(
		[name, description, config],
		() => {
			const changed = name.value !== originalName.value || description.value !== originalDescription.value || isConfigChanged();
			if (blocked.value !== changed) blocked.value = changed;
		},
		{ deep: true }
	);

	onBeforeRouteLeave((event) => {
		abortController.abort();

		if (blocked.value) {
			addToast({
				message: `You have unsaved changes in the group settings. Please save before leaving this page.`,
				type: "warning",
				duration: 10000,
				discard: () => {
					blocked.value = false;
					navigateTo(event.fullPath);
				},
				save: () => {
					blocked.value = false;
					clickButton();
					navigateTo(event.fullPath);
				},
			});
			return false;
		}
	});

	const loading = ref(false);
	const schema = toTypedSchema(
		zod.object({
			name: zod.string({ message: "This field is required" }).nonempty({ message: "This field is required" }),
			description: zod.string({ message: "This field is required" }).nonempty({ message: "This field is required" }),
		})
	);

	const handleSubmit = async (values: Record<string, any>, actions: Actions) => {
		loading.value = true;

		await new Promise((resolve) => setTimeout(resolve, 2000));

		values.configuration = {};

		config.value.sections.forEach((section: { options: { key: string; value: boolean }[] }) => {
			section.options.forEach((option) => {
				values.configuration[option.key] = option.value;
			});
		});

		const { error } = await makeRequest<null>(`/api/moments/${content.value.id}`, {
			method: "PATCH",
			body: values,
		});

		await settings.reload();

		if (!error.value)
			addToast({
				message: `Group settings have been updated`,
				type: "success",
				duration: 5000,
			});
		else {
			await new Promise((resolve) => setTimeout(resolve, 1000));
			if (error.value.data && error.value.data.error?.type == "fields") actions.setErrors(error.value.data.error.details);
			addToast({
				message: `An error occurred, unable to save the changes`,
				type: "error",
				duration: 5000,
			});
		}

		loading.value = false;
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
