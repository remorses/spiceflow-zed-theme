import fs from "node:fs/promises";
import { getTheme } from "./theme.js";

const writeData = {
  $schema: "https://zed.dev/schema/themes/v0.1.0.json",
  name: "Spiceflow Theme",
  author: "Tommy D. Rossi & Pyae Sone Aung",
  themes: [
    getTheme({ themeKey: "light", name: "Spiceflow Light", type: "light" }),
    getTheme({ themeKey: "light_colorblind", name: "Spiceflow Light High Contrast", type: "light" }),
    getTheme({ themeKey: "dark", name: "Spiceflow Dark", type: "dark" }),
    getTheme({
      themeKey: "dark_dimmed",
      name: "Spiceflow Dark Dimmed",
      type: "dark",
    }),
    getTheme({ themeKey: "dark_colorblind", name: "Spiceflow Dark High Contrast", type: "dark" }),
  ],
};

await fs.mkdir("./themes", { recursive: true });

await fs.writeFile(
  "./themes/spiceflow_theme.json",
  JSON.stringify(writeData, null, 2),
);
