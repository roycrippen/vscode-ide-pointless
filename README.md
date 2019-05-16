# Pointless IDE Extension for vscode

### Clone repository
* `git clone https://github.com/roycrippen/vscode-ide-pointless.git` ...clone the repo

### Install extension
* `Extensions icon` => in vscode select extension icon in left panel
* `...` => select More actions...
* `Install from VSIX...` => select Install from VSIX...
* `vscode-joy-editor-0.0.9.vsix` => select file 
* `install` => click install button

### Build extension (requires [vsce](https://code.visualstudio.com/docs/extensions/publish-extension))
* `bash install.sh` => run node install scripts
* `cd editor` => change directory to joy execution engine
* `node_modules/webpack/bin/webpack.js` => compile the joy execution engine
* `cd ..` => backup
* `vsce package` ...build extension

Other links
  * [Pointless Language](https://github.com/roycrippen/pointless-hs) information and engine.
  * [Pointless Syntax Highlighting](https://github.com/roycrippen/vscode-language-pointless) vscode extension
  * [Pointless Documentation](https://github.com/roycrippen/pointless-hs/wiki/Primitives)

