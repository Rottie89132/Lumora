import { useScheduler } from "#scheduler";
import { consola } from "consola";

export default defineNitroPlugin(async () => {

    const scheduler = useScheduler();

    consola.ready("Monitor initialized")
    scheduler.run(async () => {
        
        await useRenderMemory()
        await useSupabaseUsage()

    }).everyMinutes(10)
});


