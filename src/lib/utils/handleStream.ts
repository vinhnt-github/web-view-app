import { v4 as uuidv4 } from 'uuid';

type StreamCallback = (data: any) => void;

interface StreamHandlerOptions {
    onMessage?: StreamCallback; // Callback for handling incoming messages
    onError?: (error: Error) => void; // Callback for handling errors
    onClose?: () => void; // Callback for handling stream closure
    onOpen?: () => void; // Callback for handling stream opening
}

export async function handleStream(
    response: Response,
    options: StreamHandlerOptions = {}
) {
    const {
        onMessage, // Function to handle each message
        onError = (error) => console.error('Stream error:', error), // Default error handler
        onClose = () => console.log('Stream closed'), // Default close handler
        onOpen = () => console.log('Stream opened'), // Default open handler
    } = options;

    if (!response.body) {
        throw new Error('Response has no body'); // Ensure the response has a body
    }

    const reader = response.body.getReader(); // Get a reader for the response body
    const decoder = new TextDecoder(); // Decoder to handle text data
    let buffer = ''; // Buffer to store incomplete data chunks

    onOpen(); // Trigger the onOpen callback

    try {
        while (true) {
            const { done, value } = await reader.read(); // Read the next chunk of data

            if (done) {
                // If the stream is done, process any remaining data in the buffer
                if (buffer && onMessage) {
                    processData(buffer, onMessage);
                }
                onClose(); // Trigger the onClose callback
                break;
            }

            // Decode the chunk and append it to the buffer
            const chunk = decoder.decode(value, { stream: true });
            buffer += chunk;

            // Split the buffer into lines and process complete lines
            const lines = buffer.split('\n');
            buffer = lines.pop() || ''; // Keep the last incomplete line in the buffer

            for (const line of lines) {
                if (line.trim()) {
                    processData(line, onMessage); // Process each complete line
                }
            }
        }
    } catch (error) {
        // Handle any errors during the stream processing
        onError(error instanceof Error ? error : new Error('Unknown error'));
        throw error;
    } finally {
        reader.releaseLock(); // Release the reader lock when done
    }
}

function processData(line: string, onMessage?: StreamCallback) {
    if (!onMessage) return; // If no onMessage callback is provided, do nothing

    if (line.startsWith('data: ')) {
        // Process lines that start with 'data: '
        console.log('line', line);

        try {
            const jsonString = line.slice(6); // Remove the 'data: ' prefix
            const data = JSON.parse(jsonString); // Parse the JSON string
            onMessage(data); // Trigger the onMessage callback with the parsed data
        } catch (error) {
            console.warn('Failed to parse SSE data:', line); // Log a warning if parsing fails
        }
    }
}