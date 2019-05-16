'use strict';

import * as vscode from 'vscode';
// import * as path from 'path';
import { JoyEditorProvider } from './providers/joyEditorProvider';
// import JoyEditorsSettings from './common/configSettings';

export function activate(context: vscode.ExtensionContext) {
    const joyEditorUri = vscode.Uri.parse('joy-editor://authority/JoyEditor');

    if (typeof vscode.window.activeTextEditor == 'undefined') {
        vscode.window.showErrorMessage("Active editor doesn't show a Pointless script - please open one and/or relaunch the Pointless Editor extension.");
    }

    // const settings = new JoyEditorsSettings();

    let provider = new JoyEditorProvider();
    let registration = vscode.workspace.registerTextDocumentContentProvider('joy-editor', provider);
    context.subscriptions.push(registration);
    let cmdOpenJoyEditor = vscode.commands.registerCommand('extension.openJoyEditor', () => {
        return vscode.commands.executeCommand(
            'vscode.previewHtml',
            joyEditorUri,
            vscode.ViewColumn.Two
        ).then((success) => {
            console.log(`starting pointless editor`)
        }, (reason) => {
            vscode.window.showErrorMessage(reason);
        });
    });
    context.subscriptions.push(cmdOpenJoyEditor, registration);
}

export default function (context: vscode.ExtensionContext): Thenable<vscode.TextEditor> {
    return new Promise<vscode.TextEditor>((resolve, reject) => {
        let settingsUri = 'settings-preview://my-extension/fake/path/to/settings';

        vscode.workspace.openTextDocument(vscode.Uri.parse(settingsUri))
            .then(doc => vscode.window.showTextDocument(doc)
                .then(editor => {
                    if (editor) {
                        resolve(editor);
                    } else {
                        resolve();
                    }
                }))
    });
}

export function deactivate() {
    console.log('deactivate');
}

export function connectWebsocket(port: number, source: string) {
    let WebSocketClient = require('websocket').w3cwebsocket;
    let ws = new WebSocketClient('ws://localhost:9160/');

    ws.onopen = function () {
        console.log("connect to websocket server");
        ws.send("load: " + source);
        ws.onmessage = function (event: any) {
            console.log(event.data)
        }
    }
}
