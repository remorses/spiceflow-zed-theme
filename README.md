# Spiceflow Zed Themes

Project inspired on [GitHub's VS Code theme](https://github.com/primer/github-vscode-theme). Generated from [Primer's Primitives](https://primer.style/primitives/) with modifications.

### Light

![Light Theme](./art/light.png)

### Dark

![Dark Theme](./art/dark.png)

### Dark Dimmed

![Dark Dimmed Theme](./art/dark_dimmed.png)

## Installation

1. Open `Command Palette`
2. Select `zed: extensions`
3. Search `Spiceflow Theme`

## Activate Theme

1. Open `Command Palette`
2. Select `theme selector: toggle`
3. Search `Spiceflow Light` or `Spiceflow Dark`

## Contributing

Feel free to fork, make changes, and submit a pull request.

## Development

```bash
npm install
npm run dev
```

## Publishing new versions

1. Update the version in `extension.toml`
2. Run `npm run build`
3. Commit and push your changes (make sure to push the built files in `themes/` as well)
4. Follow the [Zed publishing docs](https://zed.dev/docs/extensions/developing-extensions#updating-an-extension) to publish the extension

.
