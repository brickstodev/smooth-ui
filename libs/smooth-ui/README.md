# Smooth UI

Angular component library with light and dark themes built on CSS custom properties.

## Installation

```sh
npm install @brickstodev/smooth-ui
# or
pnpm add @brickstodev/smooth-ui
```

Peer dependencies: `@angular/core` and `@angular/common` `^22.2.0`.

## Theme styles

Add the theme to the `styles` array of your application's build target (`angular.json` or `project.json`):

```json
"styles": ["node_modules/@brickstodev/smooth-ui/theme/theme.scss", "src/styles.scss"]
```

The active theme is selected with the `data-theme="light"` or `data-theme="dark"` attribute on `<html>`.

## Theme init script

To avoid a flash of the wrong theme, serve `theme-init.js` as an asset:

```json
"assets": [{ "glob": "theme-init.js", "input": "node_modules/@brickstodev/smooth-ui/theme", "output": "/" }]
```

Then load it in the `<head>` of `index.html`, right after `<base>` (so the relative path also resolves on nested routes) and before any stylesheet, without `async` or `defer`:

```html
<head>
  <base href="/" />
  <script src="theme-init.js"></script>
  <!-- stylesheets -->
</head>
```

With SSR or prerendering, disable critical CSS inlining in the production configuration. Otherwise only the rules matching the server-rendered HTML (which has no `data-theme`) are inlined, the full stylesheet loads without blocking, and the dark theme rules arrive after the first paint:

```json
"optimization": { "scripts": true, "styles": { "minify": true, "inlineCritical": false }, "fonts": true }
```

The script only reads the saved preference (`localStorage['sui-theme']`) or, if there is none, the system color scheme, and sets `data-theme` before the first paint.

## Components

How to use each component is documented in the Smooth UI demo app that accompanies the library.
