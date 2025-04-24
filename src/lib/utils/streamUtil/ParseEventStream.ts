export class ParseEventStream extends TransformStream<Uint8Array, string> {
    constructor() {
        super({
            start(controller) {
                // Called when the stream starts
                console.log("ParseEventStream", controller);
            },
            transform(chunk, controller) {
                // This is the data being passed into the transform method.
                // It could be a Uint8Array (binary data) or a string, depending on the source of the stream.
                // If it's binary data, decode it to a string
                const decodedChunk = new TextDecoder('utf8').decode(chunk, { stream: true });
                console.log('decodedChunk', decodedChunk);
                controller.enqueue(decodedChunk);
            },
            flush(controller) {
                // Called when the stream is closed
                console.log("ParseEventStream", controller);
            }
        });
    }
}