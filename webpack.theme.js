const webpack = require('webpack');

const THEMES = ['dark', 'light'];
const themeName = process.env.SB_THEME || 'light';
if (!THEMES.includes(themeName)) {
  throw new Error(`SB_THEME="${themeName}" は未定義のテーマです (${THEMES.join(' | ')})`);
}

const palette = require(`./src/themes/${themeName}.json`);

const sassAdditionalData = Object.entries(palette.ui)
  .map(([key, value]) => `$${key}: ${value};`)
  .join('\n') + '\n';

// ローディング画面は JS バンドルより先に表示されるため、色を静的 CSS として別出力する
class EmitThemeCssPlugin {
  apply(compiler) {
    const css = `:root{--sb-bg:${palette.ui['col-bg']};--sb-fg:${palette.ui['col-frnt']};}\n`;
    compiler.hooks.thisCompilation.tap('EmitThemeCssPlugin', (compilation) => {
      compilation.hooks.processAssets.tap(
        { name: 'EmitThemeCssPlugin', stage: webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL },
        () => compilation.emitAsset('theme.css', new webpack.sources.RawSource(css))
      );
    });
  }
}

module.exports = {
  sassAdditionalData,
  plugins: [
    new webpack.DefinePlugin({
      SB_THEME: JSON.stringify(themeName),
      SB_PALETTE: JSON.stringify(palette),
    }),
    new EmitThemeCssPlugin(),
  ],
};
