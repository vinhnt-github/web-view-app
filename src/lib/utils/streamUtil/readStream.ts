export async function readStream<T>(stream: ReadableStream<T>, callback: (value: T) => void) {
    const reader = stream.getReader();
    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                console.log('Stream finished');
                break;
            }
            try {
                callback(value);
            } catch (error) {
                reader.releaseLock();
                return Promise.reject(error);
            }
        }
    } catch (error) {
        throw error;
    }
}