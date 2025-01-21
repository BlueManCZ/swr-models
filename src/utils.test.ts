import { convertObjectValuesToString } from "./utils";

describe("utils", () => {
    it("convertObjectValuesToString", () => {
        expect(
            convertObjectValuesToString({
                a: "a",
                b: 2,
                c: true,
            }),
        ).toStrictEqual({
            a: "a",
            b: "2",
            c: "true",
        });
    });
});
