import { templates } from "../templates";
import { languages } from "../languages";
import { writeFile } from "./writeFile";
export { localizeMessage } from "./localizeMessage";
export { writeFile } from "./writeFile";

if (templates.length === 0) {
    throw new Error("No templates found");
}

if (languages.length === 0) {
    throw new Error("No languages found");
}

const validateHTML = async (templateContent: string) => {
    const validator = require("html-validator");
    const options = {
        data: templateContent,
        format: "text",
    };
    try {
        const result = await validator(options);
        console.log(result);
    } catch (error) {
        console.error(error);
    }
};

const generateTemplates = async () => {
    for (const template of templates) {
        const templateContent = require(`../templates/${template}`).default;
        // await validateHTML(templateContent);
        writeFile(template, templateContent);
    }
};

generateTemplates();
