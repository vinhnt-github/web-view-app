import { getServer } from "@/support/msw/node";

beforeAll(() => {
    // Enable API mocking
    console.log("Start setup server for jest");
    getServer().listen();
});

afterEach(() => {
    // Reset handlers between tests
    getServer().resetHandlers();
});

afterAll(() => {
    // Clean up after tests
    getServer().close();
}); 