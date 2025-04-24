export class ExtractDataaJSONStream<T = unknown> extends TransformStream<string, T> {
    constructor() {
        super({
            start(controller) {
                // Called when the stream starts
                console.log("ExtractDataaJSONStream", controller);
            },
            transform(eventString, controller) {
                const chunk = eventString.split("\n")
                    .filter((line) => line.length)
                for (const line of chunk) {
                    if (line.startsWith("data:")) {
                        const jsonString = line.slice('data:'.length);
                        try {
                            const json = JSON.parse(jsonString);
                            controller.enqueue(json as T);
                        } catch (error) {
                            // TODO: handle error
                            throw new Error(`Failed to parse JSON: ${jsonString}`);
                        }
                    }
                }
            },
            flush(controller) {
                // Called when the stream is closed
                console.log("ParseEventStream", controller);
            }
        });
    }
}