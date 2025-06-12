import { getColorTokens, type ThemeKey } from "./tokens.js";
import oneDark from './one_dark.json'
import oneLight from './one_light.json'


interface ThemeParams {
  themeKey: ThemeKey;
  name: string;
  type: 'light' | 'dark';
}



interface ThemeStyle {
  appearance: 'light' | 'dark';
  name: string;
  style: {
    [key: string]: any;
  };
}

export function getTheme({ themeKey, name, type }: ThemeParams): ThemeStyle {
  const tokens = getColorTokens(themeKey);

  /**
   * Helper function to select token based on theme type
   */
  const lightDark = (lightTokenName: string, darkTokenName: string): string => {
    return themeKey.startsWith('light') ? (tokens[lightTokenName] || '') : (tokens[darkTokenName]      || '');
  };

  /**
   * Convert hex color to HSL
   */
  const hexToHsl = (hex: string): [number, number, number] => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h: number, s: number, l = (max + min) / 2;

    if (max === min) {
      h = s = 0; // achromatic
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
        default: h = 0;
      }
      h /= 6;
    }

    return [h * 360, s * 100, l * 100];
  };
  /**
   * Convert HSL to hex color
   */
   const hslToHex = (h: number, s: number, l: number): string => {
     // Cap max values
     h = Math.min(h, 360);
     s = Math.min(s, 100);
     l = Math.min(l, 100);

     l /= 100;
     const a = s * Math.min(l, 1 - l) / 100;
     const f = (n: number) => {
       const k = (n + h / 30) % 12;
       const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
       return Math.round(255 * color).toString(16).padStart(2, '0');
     };
     return `#${f(0)}${f(8)}${f(4)}`;
   };
  /**
   * Convert red hue to purple hue while preserving brightness and saturation
   */
  const redToPurple = (hexColor: string): string => {
    if (!hexColor || !hexColor.startsWith('#')) return hexColor;

    // Extract alpha if present
    const hasAlpha = hexColor.length === 9;
    const alpha = hasAlpha ? hexColor.slice(7) : '';
    const baseColor = hasAlpha ? hexColor.slice(0, 7) : hexColor;

    let [h, s, l] = hexToHsl(baseColor);

    // Convert red hue (~0°) to purple hue (~280°)
    // Red range is roughly 340-20 degrees, purple is around 280

    if (h <= 20 || h >= 340) {
      // This is in the red range, convert to purple
      h = 260;
      l += 30
      s += 40
    }
    return hslToHex(h, s, l) + alpha;
  };
  /**
   * Add alpha transparency to a color token
   */
  const alpha = (tokenName: string, alphaValue: number): string | null => {
    const baseToken = tokens[tokenName] || tokenName;
    if (!baseToken) {
      console.warn(`Token '${tokenName}' not found in theme '${themeKey}'`);
      return null;
    }

    const hexAlpha = Math.round(alphaValue * 255).toString(16).padStart(2, '0');

    // Remove the '#' if present
    let color = baseToken.replace('#', '');

    // If it's already an 8-digit HEXA, replace the last two characters
    if (color.length === 8) {
      color = color.slice(0, 6) + hexAlpha;
    }
    // If it's a 6-digit HEX, append the new alpha
    else if (color.length === 6) {
      color += hexAlpha;
    }
    // If it's a 3-digit HEX, expand it and append the new alpha
    else if (color.length === 3) {
      color = color.split('').map(char => char + char).join('') + hexAlpha;
    }
    else {
      console.warn(`Invalid color format for token '${tokenName}': ${baseToken}`);
      return baseToken;
    }

    return '#' + color;
  };

  // Custom gray palette similar to VS Code theme
  const customGrays: Record<string, string> = {
    // Main backgrounds
    'bgColor/default': '#1E1E1E',
    'bgColor/muted': '#292929',
    'bgColor/inset': '#252526',
    'bgColor/disabled': '#383B3D',
    'overlay/bgColor': '#2D2D30',
    // Neutral muted for elements
    'bgColor/neutral-muted': '#3A3D41',
  };

  /**
   * Get color with custom gray overrides for dark themes
   */
  const getColor = (tokenName: string): string => {
    if (!themeKey.startsWith('light') && customGrays[tokenName]) {
      return customGrays[tokenName] + 'ff'; // Add full opacity
    }
    return tokens[tokenName] || '';
  };

  return {
    appearance: type,
    name,
    style: {
      "background": getColor('bgColor/default'),
      "border": tokens['borderColor/default'] || '',

      "border.disabled": tokens['borderColor/disabled'] || '',
      "border.focused": tokens['borderColor/accent-emphasis'] || '',
      "border.selected": tokens['borderColor/accent-emphasis'] || '',
      "border.transparent": tokens['borderColor/transparent'] || '',
      "border.variant": tokens['borderColor/muted'] || '',

      "conflict": tokens['fgColor/severe'] || '',
      "conflict.background": tokens['bgColor/severe-muted'] || '',
      "conflict.border": tokens['borderColor/severe-muted'] || '',

      "created": tokens['fgColor/success'] || '',
      "created.background": tokens['bgColor/success-muted'] || '',
      "created.border": tokens['borderColor/success-muted'] || '',

      "deleted": (tokens['fgColor/done'] || ''),
      "deleted.background": (tokens['bgColor/done-muted'] || ''),
      "deleted.border": (tokens['borderColor/done-muted'] || ''),

      "drop_target.background": tokens['bgColor/accent-muted'] || '',

      "editor.active_line.background": getColor('bgColor/muted'),
      "editor.active_line_number": tokens['fgColor/default'] || '',
      "editor.active_wrap_guide": tokens['borderColor/muted'] || '',
      "editor.background": getColor('bgColor/default'),
      "editor.document_highlight.read_background": alpha("fgColor/accent", 0.3) || '',
      "editor.document_highlight.write_background": alpha("fgColor/accent", 0.2) || '',
      "editor.foreground": tokens['fgColor/default'] || '',
      "editor.gutter.background": getColor('bgColor/default'),
      "editor.highlighted_line.background": getColor('bgColor/neutral-muted'),
      "editor.invisible": tokens['fgColor/disabled'] || '',
      "editor.line_number": tokens['fgColor/muted'] || '',
      "editor.subheader.background": getColor('bgColor/muted'),
      "editor.wrap_guide": tokens['borderColor/muted'] || '',

      "element.active": getColor('bgColor/neutral-muted'),
      "element.background": getColor('bgColor/neutral-muted'),
      "element.disabled": getColor('bgColor/disabled'),
      "element.hover": getColor('bgColor/neutral-muted'),
      "element.selected": getColor('bgColor/neutral-muted'),

      "elevated_surface.background": getColor('overlay/bgColor'),

      "error": tokens['fgColor/danger'] || '',
      "error.background": tokens['bgColor/muted'] || '',
      "error.border": tokens['borderColor/muted'] || '',

      "ghost_element.active": getColor('bgColor/neutral-muted'),
      "ghost_element.background": tokens['bgColor/transparent'] || '',
      "ghost_element.disabled": getColor('bgColor/disabled'),
      "ghost_element.hover": getColor('bgColor/neutral-muted'),
      "ghost_element.selected": getColor('bgColor/neutral-muted'),

      "hidden": tokens['fgColor/disabled'] || '',
      "hidden.background": tokens['bgColor/disabled'] || '',
      "hidden.border": tokens['borderColor/disabled'] || '',

      "hint": tokens['fgColor/muted'] || '',
      "hint.background": tokens['bgColor/muted'] || '',
      "hint.border": tokens['borderColor/muted'] || '',

      "icon": tokens['fgColor/default'] || '',
      "icon.background": tokens['bgColor/default'] || '',
      "icon.border": tokens['borderColor/default'] || '',
      "icon.accent": tokens['fgColor/accent'] || '',
      "icon.muted": tokens['fgColor/muted'] || '',
      "icon.disabled": tokens['fgColor/disabled'] || '',
      "icon.placeholder": tokens['fgColor/muted'] || '',

      "ignored": tokens['fgColor/muted'] || '',
      "ignored.background": tokens['bgColor/disabled'] || '',
      "ignored.border": tokens['borderColor/disabled'] || '',

      "info": tokens['fgColor/muted'] || '',
      "info.background": tokens['bgColor/muted'] || '',
      "info.border": tokens['borderColor/muted'] || '',

      "link_text.hover": tokens['fgColor/link'] || '',

      "modified": tokens['fgColor/attention'] || '',
      "modified.background": tokens['bgColor/attention-muted'] || '',
      "modified.border": tokens['borderColor/attention-muted'] || '',

      "pane.focused_border": tokens['borderColor/default'] || '',
      "panel.background": getColor('bgColor/inset'),
      "panel.focused_border": tokens['borderColor/default'] || '',

      "predictive": tokens['fgColor/muted'] || '',
      "predictive.background": getColor('bgColor/neutral-muted'),
      "predictive.border": tokens['borderColor/neutral-muted'] || '',

      "renamed": tokens['fgColor/success'] || '',
      "renamed.background": tokens['bgColor/success-muted'] || '',
      "renamed.border": tokens['borderColor/success-muted'] || '',

      "scrollbar.thumb.border": tokens['borderColor/transparent'] || '',
      "scrollbar.thumb.hover_background": tokens['bgColor/muted'] || '',
      "scrollbar.track.background": tokens['bgColor/transparent'] || '',
      "scrollbar.track.border": tokens['borderColor/transparent'] || '',
      "scrollbar.thumb.background": tokens['bgColor/neutral-muted'] || '',

      "search.match_background": alpha("base/color/yellow/1", 0.3) || '',

      "status_bar.background": getColor('bgColor/inset'),

      "success": tokens['fgColor/success'] || '',
      "success.background": tokens['bgColor/success-muted'] || '',
      "success.border": tokens['borderColor/success-muted'] || '',

      "surface.background": getColor('bgColor/inset'),

      "tab.active_background": getColor('bgColor/default'),
      "tab.inactive_background": getColor('bgColor/inset'),
      "tab_bar.background": getColor('bgColor/inset'),

      "terminal.ansi.black": tokens['color/ansi/black'] || '',
      "terminal.ansi.bright_black": tokens['color/ansi/black-bright'] || '',
      "terminal.ansi.dim_black": tokens['color/ansi/black'] || '',
      "terminal.ansi.blue": tokens['color/ansi/blue'] || '',
      "terminal.ansi.bright_blue": tokens['color/ansi/blue-bright'] || '',
      "terminal.ansi.dim_blue": tokens['color/ansi/blue'] || '',
      "terminal.ansi.cyan": tokens['color/ansi/cyan'] || '',
      "terminal.ansi.bright_cyan": tokens['color/ansi/cyan-bright'] || '',
      "terminal.ansi.dim_cyan": tokens['color/ansi/cyan'] || '',
      "terminal.ansi.green": type === 'dark' ? oneDark.style['terminal.ansi.green'] : oneLight.style['terminal.ansi.green'],
      "terminal.ansi.bright_green": type === 'dark' ? oneDark.style['terminal.ansi.bright_green'] : oneLight.style['terminal.ansi.bright_green'],
      "terminal.ansi.dim_green": type === 'dark' ? oneDark.style['terminal.ansi.dim_green'] : oneLight.style['terminal.ansi.dim_green'],
      "terminal.ansi.magenta": tokens['color/ansi/magenta'] || '',
      "terminal.ansi.bright_magenta": tokens['color/ansi/magenta-bright'] || '',
      "terminal.ansi.dim_magenta": tokens['color/ansi/magenta'] || '',
      "terminal.ansi.red": tokens['color/ansi/red'] || '',
      "terminal.ansi.bright_red": tokens['color/ansi/red-bright'] || '',
      "terminal.ansi.dim_red": tokens['color/ansi/red'] || '',
      "terminal.ansi.white": tokens['color/ansi/white'] || '',
      "terminal.ansi.bright_white": tokens['color/ansi/white-bright'] || '',
      "terminal.ansi.dim_white": tokens['color/ansi/white'] || '',
      "terminal.ansi.yellow": tokens['color/ansi/yellow'] || '',
      "terminal.ansi.bright_yellow": tokens['color/ansi/yellow-bright'] || '',
      "terminal.ansi.dim_yellow": tokens['color/ansi/yellow'] || '',

      "terminal.background": getColor('bgColor/inset'),
      "terminal.bright_foreground": tokens['fgColor/onEmphasis'] || '',
      "terminal.dim_foreground": tokens['fgColor/muted'] || '',
      "terminal.foreground": tokens['fgColor/default'] || '',

      "text": tokens['fgColor/default'] || '',
      "text.accent": tokens['fgColor/accent'] || '',
      "text.disabled": tokens['fgColor/disabled'] || '',
      "text.muted": tokens['fgColor/default'] || '',
      "text.placeholder": tokens['fgColor/muted'] || '',

      "title_bar.background": getColor('bgColor/inset'),
      "toolbar.background": getColor('bgColor/default'),

      "unreachable": tokens['fgColor/disabled'] || '',
      "unreachable.background": tokens['bgColor/disabled'] || '',
      "unreachable.border": tokens['borderColor/disabled'] || '',

      "warning": alpha(tokens['fgColor/attention'], 0.8) || '',
      "warning.background": tokens['bgColor/muted'] || '',
      "warning.border": tokens['borderColor/muted'] || '',

      "players": [
        "blue",
        "orange",
        "pink",
        "green",
        "purple",
        "yellow",
        "teal",
        "red"
        ].map((color) => {

          return {
            cursor: tokens[`data/${color}/color/emphasis`] || "",
            background: tokens[`data/${color}/color/emphasis`] || "",
            selection: alpha(`data/${color}/color/emphasis`, 0.4) || "",
          };
      }),
      "syntax": {
        "attribute": {
          "color": null,
          "font_style": null,
          "font_weight": null
        },
        "boolean": {
          "color": lightDark("base/color/blue/6", "base/color/blue/2"),
          "font_style": null,
          "font_weight": null
        },
        "comment": {
          "color": tokens["base/color/neutral/9"] || '',
          "font_style": null,
          "font_weight": null
        },
        "comment.doc": {
          "color": tokens["base/color/neutral/9"] || '',
          "font_style": null,
          "font_weight": null
        },
        "constant": {
          "color": lightDark("base/color/blue/6", "base/color/blue/2"),
          "font_style": null,
          "font_weight": null
        },
        "constructor": {
          "color": lightDark("base/color/blue/6", "base/color/blue/2"),
          "font_style": null,
          "font_weight": null
        },
        "embedded": {
          "color": lightDark("base/color/red/5", "base/color/red/3"),
          "font_style": null,
          "font_weight": null
        },
        "emphasis": {
          "color": null,
          "font_style": "italic",
          "font_weight": null
        },
        "emphasis.strong": {
          "color": null,
          "font_style": null,
          "font_weight": 700
        },
        "enum": {
          "color": lightDark("base/color/orange/6", "base/color/orange/2"),
          "font_style": null,
          "font_weight": null
        },
        "function": {
          "color": lightDark("base/color/purple/5", "base/color/purple/2"),
          "font_style": null,
          "font_weight": null
        },
        "function.method": {
          "color": lightDark("base/color/purple/5", "base/color/purple/2"),
          "font_style": null,
          "font_weight": null
        },
        "function.special.definition": {
          "color": lightDark("base/color/purple/5", "base/color/purple/2"),
          "font_style": null,
          "font_weight": null
        },
        "hint": {
          "color": tokens["fgColor/muted"] || '',
          "font_style": null,
          "font_weight": 700
        },
        "keyword": {
          "color": lightDark("base/color/red/5", "base/color/red/3"),
          "font_style": null,
          "font_weight": null
        },
        "label": {
          "color": lightDark("base/color/blue/6", "base/color/blue/2"),
          "font_style": null,
          "font_weight": null
        },
        "link_text": {
          "color": lightDark("base/color/blue/8", "base/color/blue/1"),
          "font_style": "italic",
          "font_weight": null
        },
        "link_uri": {
          "color": lightDark("base/color/blue/6", "base/color/blue/2"),
          "font_style": null,
          "font_weight": null
        },
        "number": {
          "color": lightDark("base/color/blue/6", "base/color/blue/2"),
          "font_style": null,
          "font_weight": null
        },
        "operator": {
          "color": tokens["fgColor/default"] || '',
          "font_style": null,
          "font_weight": null
        },
        "predictive": {
          "color": tokens["fgColor/muted"] || '',
          "font_style": "italic",
          "font_weight": null
        },
        "preproc": {
          "color": lightDark("base/color/red/5", "base/color/red/3"),
          "font_style": null,
          "font_weight": null
        },
        "primary": {
          "color": tokens["fgColor/default"] || '',
          "font_style": null,
          "font_weight": null
        },
        "property": {
          "color": lightDark("base/color/blue/6", "base/color/blue/2"),
          "font_style": null,
          "font_weight": null
        },
        "punctuation": {
          "color": tokens["fgColor/default"] || '',
          "font_style": null,
          "font_weight": null
        },
        "punctuation.bracket": {
          "color": tokens["fgColor/default"] || '',
          "font_style": null,
          "font_weight": null
        },
        "punctuation.delimiter": {
          "color": tokens["fgColor/default"] || '',
          "font_style": null,
          "font_weight": null
        },
        "punctuation.list_marker": {
          "color": lightDark("base/color/orange/6", "base/color/orange/2"),
          "font_style": null,
          "font_weight": null
        },
        "punctuation.special": {
          "color": lightDark("base/color/red/5", "base/color/red/3"),
          "font_style": null,
          "font_weight": null
        },
        "string": {
          "color": lightDark("base/color/blue/8", "base/color/blue/1"),
          "font_style": null,
          "font_weight": null
        },
        "string.escape": {
          "color": lightDark("base/color/green/6", "base/color/green/1"),
          "font_style": null,
          "font_weight": 700
        },
        "string.regex": {
          "color": lightDark("base/color/blue/8", "base/color/blue/1"),
          "font_style": null,
          "font_weight": null
        },
        "string.special": {
          "color": lightDark("base/color/blue/6", "base/color/blue/2"),
          "font_style": null,
          "font_weight": null
        },
        "string.special.symbol": {
          "color": lightDark("base/color/blue/6", "base/color/blue/2"),
          "font_style": null,
          "font_weight": null
        },
        "tag": {
          "color": lightDark("base/color/green/6", "base/color/green/1"),
          "font_style": null,
          "font_weight": null
        },
        "text.literal": {
          "color": lightDark("base/color/blue/6", "base/color/blue/2"),
          "font_style": null,
          "font_weight": null
        },
        "title": {
          "color": lightDark("base/color/blue/6", "base/color/blue/2"),
          "font_style": null,
          "font_weight": 700
        },
        "type": {
          "color": lightDark("base/color/orange/6", "base/color/orange/2"),
          "font_style": null,
          "font_weight": null
        },
        "variable": {
          "color": tokens["fgColor/default"] || '',
          "font_style": null,
          "font_weight": null
        },
        "variable.special": {
          "color": lightDark("base/color/red/5", "base/color/red/3"),
          "font_style": null,
          "font_weight": null
        },
        "variant": {
          "color": lightDark("base/color/orange/6", "base/color/orange/2"),
          "font_style": null,
          "font_weight": null
        }
      }
    }
  };
}
