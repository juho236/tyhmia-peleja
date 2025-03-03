let delay = 0.1;

const ping = async () => {
    await new Promise(completed => { window.setTimeout(completed,delay * 1000); });
}

export const FetchResponse = async (path) => {
    const response = await fetch(path);
    await ping();

    return response;
}
export const FetchRaw = async (path) => {
    const response = await FetchResponse(path);
    await ping();

    return await response.text();
}
export const FetchBlob = async (path) => {
    const response = await FetchResponse(path);
    await ping();

    return await response.blob();
}