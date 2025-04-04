export function useRetryableFetch<T>(configuration: { max?: number; delay?: number; throwOnError?: boolean } = {}) {
    const data = ref<T | null>(null);
    const error = ref<any>(null);
    const loading = ref(false);

    const { max, delay, throwOnError } = { max: 3, delay: 250, throwOnError: true, ...configuration };

    const fetchWithRetry = async (url: Parameters<typeof $fetch>[0], options: Parameters<typeof $fetch>[1] & { sessions?: boolean }, attempts = 0): Promise<void> => {
        return await $fetch(url, options).then((response) => {data.value = response;}).catch((err) => {
            error.value = err;
            if (++attempts < max) return new Promise((resolve) => setTimeout(resolve, delay)).then(() => fetchWithRetry(url, options, attempts));
            
            if (throwOnError) throw createError({
                statusCode: error.value?.data?.status?.code || 500,
                message: error.value?.data?.status?.message || "An unknown error occurred",
                fatal: true,
            });
            
        });
    };

    const makeRequest = (url: Parameters<typeof $fetch>[0], options: Parameters<typeof $fetch>[1] & { sessions?: boolean } = {}): Promise<void> => {
        loading.value = true;
        error.value = null;
        return fetchWithRetry(url, options).finally(() => {loading.value = false});
    };

    return {
        data,
        error,
        loading,
        makeRequest,
    };
}