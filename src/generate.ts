import fs from "node:fs/promises";
import { getTheme } from "./theme.js";

interface WriteData {
  $schema: string;
  name: string;
  author: string;
  themes: ReturnType<typeof getTheme>[];
}

const writeData: WriteData = {
  $schema: "https://zed.dev/schema/themes/v0.1.0.json",
  name: "Spiceflow Theme",
  author: "Tommy D. Rossi & Pyae Sone Aung",
  themes: [
    getTheme({ themeKey: "light", name: "Spiceflow Light", type: "light" }),
    getTheme({ themeKey: "dark", name: "Spiceflow Dark", type: "dark" }),
  ],
};

await fs.mkdir("./themes", { recursive: true });

await fs.writeFile(
  "./themes/spiceflow_theme.json",
  JSON.stringify(writeData, null, 2),
);
