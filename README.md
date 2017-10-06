# Welcome to the Joy Editor Extension for vscode

# How to run locally
* `git clone` ...clone the repo
* `cd vscode-joy-editor` ...change directory to extension folder
* `npm install` ...install dependencies
* `cd engine` ...change directory to joy execution engine
* `npm install`...install dependencies
* `./node_modules/webpack/bin/webpack.js` ...compile the joy execution engine
* `code` or `vscode` ...open vscode
* `File : Open Folder` ...open `vscode-joy-editor` folder from within vscode
* `ctrl+shift+P` ...type `Run Task`, select `Tasks:Run Task`, then select `npm`

## Get up and running straight away
* press `F5` to run in extension in debug mode
* open a .joy source file
* press `Ctrl+Shift+P` or `Cmd+Shift+P` on Mac to toggle the command dropdown,  type `Joy Editor`, and select `Joy Editor: Launch the Editor`

## References
Interactive editor component forked from brief editor
author: AshleyF url: https://github.com/AshleyF/brief