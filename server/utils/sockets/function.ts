let payloadString: string | null = null;

export const userServerSocket = () => {
    const broadcastEvent = (payload: Record<string, any>) => {
        payloadString = JSON.stringify(payload);
    };

    const getPayLoad = () => {
        return payloadString;
    };

    const deletePayLoad = () => {
        payloadString = null;
    };

    return {
        getPayLoad, 
        broadcastEvent,
        deletePayLoad
    };
};