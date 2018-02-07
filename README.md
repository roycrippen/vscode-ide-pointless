# Welcome to the Joy Editor Extension for vscode

# How to install and build extension
* `git clone` ...clone the repo
* `cd vscode-ide-pointless` ...change directory to extension folder
* `npm install` ...install dependencies
* `cd editor` ...change directory to joy execution engine
* `npm install` ...install dependencies
* `./node_modules/webpack/bin/webpack.js` ...compile the joy execution engine
* `cd ..` ...backup
* ...install vsce globally https://code.visualstudio.com/docs/extensions/publish-extension
* `vsce package` ...build extension
* `Install from VSIX...`...install extension in vscode from extensions menu


Other links
  * [Pointless Language](https://github.com/roycrippen/pointless-hs) information and engine.
  * [Pointless Syntax Highlighting](https://github.com/roycrippen/vscode-language-pointless) vscode extension
  * [Pointless Documentation](https://github.com/roycrippen/pointless-hs/wiki/Primitives)
