import { SWRModelEndpoint } from "./SWRModelEndpoint";

describe("SWRModelEndpoint", () => {
    it("Configurable endpoint", () => {
        const testEndpoint = new SWRModelEndpoint({
            key: "test",
        });
        expect(testEndpoint.endpoint()).toBe("test");
        expect(testEndpoint.endpoint({ id: 50 })).toBe("test/50");
        expect(testEndpoint.endpoint({ id: "50" })).toBe("test/50");
        expect(testEndpoint.endpoint({ params: { a: "b" } })).toBe("test?a=b");
        expect(testEndpoint.endpoint({ id: 50, params: { a: "b" } })).toBe("test/50?a=b");
        expect(testEndpoint.endpoint({ id: "50", params: { a: "b", c: "d" } })).toBe("test/50?a=b&c=d");
        expect(testEndpoint.endpoint({ id: "50", params: { a: 1, b: true } })).toBe("test/50?a=1&b=true");
    });
});
