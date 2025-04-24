import { v4 as uuidv4 } from 'uuid';
import { readStream } from './streamUtil/readStream';

type StreamCallback = (data: any) => void;

interface StreamHandlerOptions {
    onMessage?: StreamCallback; // Callback for handling incoming messages
    onError?: (error: Error) => void; // Callback for handling errors
    onClose?: () => void; // Callback for handling stream closure
    onOpen?: () => void; // Callback for handling stream opening
}

export async function handleStream({
    stream,
    options
}: {
    stream: ReadableStream<string>
    options: StreamHandlerOptions
}
) {
    const {
        onMessage, // Function to handle each message
        onError = (error) => console.error('Stream error:', error), // Default error handler
        onClose = () => console.log('Stream closed'), // Default close handler
        onOpen = () => console.log('Stream opened'), // Default open handler
    } = options;
    return await readStream<string>(stream, (value) => {
        try {
            console.log('value', value)
        } catch (error) {
            onError(error as Error);
        }
    }).catch((error) => {
        onError(error as Error);
    }).finally(() => {
        onClose();
    });
}
