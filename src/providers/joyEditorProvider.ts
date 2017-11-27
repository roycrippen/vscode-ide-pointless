import * as vscode from 'vscode';
import * as path from 'path';
import { lexJoyCommands } from "../../engine/src/joy-lexer";
const fs = require('fs');

var _joyExtension = "joy";
var _providerHtml = "";

export class JoyEditorProvider implements vscode.TextDocumentContentProvider {

    private _onDidChange = new vscode.EventEmitter<vscode.Uri>();

    /**
     * Constructor.
     * 
     * @param options - socket options
     */
    public constructor() {
    }

    /**
     * Function that provides the text document content.
     * 
     * @param uri - provided file uri
     */
    public provideTextDocumentContent(uri: vscode.Uri): string {
        return this.createJoyEditorPreview(uri);
    }

    /**
     * Function invoked after changes on made to the provided text document content.
     */
    get onDidChange(): vscode.Event<vscode.Uri> {
        return this._onDidChange.event;
    }

    /**
     * Update Callback.
     * 
     * @param uri - provided file uri
     */
    public update(uri: vscode.Uri) {
        this._onDidChange.fire(uri);
    }

    /**
     * Create the Joy Editor Preview.
     * 
     * @param uri - provided file uri
     */
    public createJoyEditorPreview(uri: vscode.Uri): string {
        const reason = "Active editor doesn't show a JOY script - please open one and/or relaunch the Joy Editor extension.";
        if (typeof vscode.window.activeTextEditor === 'undefined' || !vscode.window.activeTextEditor.document.fileName.endsWith(_joyExtension)) {
            _providerHtml = this.errorPreview(reason);
            return _providerHtml
        }
        return this.joyEditorPreview(uri);
    }


    /**
     * Parse a joy file into memory. This function will return an array of joy files represented as strings.
     * If the root joy file references other joy files (via the libload keyword) those files will are added
     * to the array via recursion.
     * 
     * @param array - array of joy files represented as strings
     * @param filename - the root joy file to parse
     */
    private recursiveLibloadParseAsArray(array: string[], filename: string): string[] {
        console.log(`parsing file: ${filename}`);

        if (vscode.window.activeTextEditor === undefined) {
            return []
        }

        var filePath = vscode.window.activeTextEditor.document.fileName.substring(0, filename.lastIndexOf(path.sep)) + path.sep;

        if (fs.existsSync(filename)) {
            const rawFile = fs.readFileSync(filename, 'utf8')
            const strippedRawFile = lexJoyCommands(rawFile).reduce((acc, token) => {
                return `${acc} ${token.value}`
            }, "")

            var strFile = JSON.stringify(strippedRawFile, null, 4);

            array.push(strFile);
            var pattern = /(?!^)"([\w+]|[.]+)+.*?"(\s+)(libload)(\s?)./g;
            var newlibMatch = strFile.match(pattern);

            if (newlibMatch !== null && typeof newlibMatch !== 'undefined') {
                newlibMatch.forEach((a) => {
                    var lib = a.match(/(^)".*?"/g);
                    if (lib !== null && typeof lib !== 'undefined' && lib.length > 0) {
                        array = this.recursiveLibloadParseAsArray(array, filePath + lib[0].trim().replace(/^"(.*)\\"$/g, '$1') + '.' + _joyExtension);
                    }
                });
            }
        }

        return array;
    }

    /**
     * Create the Joy Editor extension as a preview tab within vscode.
     * 
     * @param uri - provided file uri
     */
    private joyEditorPreview(uri: vscode.Uri): string {

        var relativePath = path.dirname(__dirname);
        if (vscode.window.activeTextEditor === undefined) {
            return ""
        }

        // var filename = vscode.window.activeTextEditor.document.fileName;

        let joyFileStrs = '" t001 == 10 10 * ; "'          // this.recursiveLibloadParseAsArray([], filename)

        var pathMain = relativePath.replace('/out/src', '/src/providers/')

        _providerHtml = fs.readFileSync(pathMain + 'main.html', 'utf8')
            .replace(/\${relativePath}/g, relativePath)
            .replace(/\${joyFileStrs}/g, joyFileStrs);


        let pathEngine = relativePath.replace('/out/src', '/engine/src/')
        fs.writeFile(pathEngine + 'testprovider.html', _providerHtml)

        return _providerHtml;
    }

    /**
     * Get the HTML markup.
     */
    public getProviderHtml(): string {
        return _providerHtml;
    }

    /**
     * Construct html markup based on a error message.
     * 
     * @param error - error message
     */
    private errorPreview(error: string): string {
        return `
      <body>
        ${error}
      </body>`;
    }
}