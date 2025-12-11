import { convertObjectValuesToString } from "./utils";

describe("utils", () => {
    it("convertObjectValuesToString", () => {
        expect(
            convertObjectValuesToString({
                a: "a",
                b: 2,
                c: true,
                d: false,
                e: null,
                f: undefined,
            }),
        ).toStrictEqual({
            a: "a",
            b: "2",
            c: "true",
            d: "false",
        });
    });
});
