import fs from "node:fs/promises";
import { getTheme } from "./theme.js";

const writeData = {
  $schema: "https://zed.dev/schema/themes/v0.1.0.json",
  name: "Github Theme Morse",
  author: "Pyae Sone Aung",
  themes: [
    getTheme({ themeKey: "dark", name: "My Github Dark", type: "dark" }),
    getTheme({ themeKey: "light", name: "Github Light", type: "light" }),
    getTheme({
      themeKey: "dark_dimmed",
      name: "My Github Dark Dimmed",
      type: "dark",
    }),
  ],
};

await fs.mkdir("./themes", { recursive: true });

await fs.writeFile(
  "./themes/github_theme.json",
  JSON.stringify(writeData, null, 2),
);
