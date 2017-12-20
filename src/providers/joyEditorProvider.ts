import * as vscode from 'vscode';
import * as path from 'path';

const fs = require('fs');

var _pointlessExtension = "pless";
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
        return this.createPointlessEditorPreview(uri);
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
    public createPointlessEditorPreview(uri: vscode.Uri): string {
        const reason = "Active editor doesn't show a Pointless script - please open one and/or relaunch the Pointless Editor extension.";
        if (typeof vscode.window.activeTextEditor === 'undefined' || !vscode.window.activeTextEditor.document.fileName.endsWith(_pointlessExtension)) {
            _providerHtml = this.errorPreview(reason);
            return _providerHtml
        }
        return this.pointlessEditorPreview(uri);
    }

    /**
     * build load command for local pointless file
     * 
     * @param filename - the root pointless file
     */
    buildLoadCommand(filename: string): string {
        console.log(`building load command for file: ${filename}`);

        if (vscode.window.activeTextEditor === undefined) {
            return ""
        }

        if (fs.existsSync(filename) && filename !== undefined) {
            const leafname = filename.replace(/^.*[\\\/]/, '')
            const path = filename.replace(leafname, "")
            const leafname_ = leafname.replace(".pless", "")
            const pathPL = " \"current-path\" [ \"" + path + "\" ] define "
            const filePL = " \"" + leafname_ + "\" libload "
            return (pathPL + filePL)
        }
        return ""
    }

    /**
     * Create the Joy Editor extension as a preview tab within vscode.
     * 
     * @param uri - provided file uri
     */
    private pointlessEditorPreview(uri: vscode.Uri): string {

        if (vscode.window.activeTextEditor === undefined) {
            return ""
        }

        const relativePath = path.dirname(__dirname);
        const pathMain = relativePath.replace('/out', '/src/providers/')
        const filename = vscode.window.activeTextEditor.document.fileName;
        const source = this.buildLoadCommand(filename)

        _providerHtml = fs.readFileSync(pathMain + 'main.html', 'utf8')
            .replace(/\${relativePath}/g, relativePath)
            .replace(/\${joyFileStr}/g, source);

        let pathEditor = relativePath.replace('/out', '/editor/src/')
        fs.writeFileSync(pathEditor + 'testprovider.html', _providerHtml)

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