import * as fs from "fs-extra";

export const writeFile = (name: string, content: string): void => {
    try {
        fs.mkdirSync("./output", { recursive: true });
        fs.writeFileSync(`output/${name}.html`, content, {
            encoding: "utf8",
        });
    } catch (err) {
        console.error(err);
    }
};
