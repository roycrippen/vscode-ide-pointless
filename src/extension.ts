'use strict';

import * as vscode from 'vscode';
// import * as path from 'path';
import { JoyEditorProvider } from './providers/joyEditorProvider';
// import JoyEditorsSettings from './common/configSettings';

export function activate(context: vscode.ExtensionContext) {
    const joyEditorUri = vscode.Uri.parse('joy-editor://authority/JoyEditor');

    if (typeof vscode.window.activeTextEditor == 'undefined') {
        vscode.window.showErrorMessage("Active editor doesn't show a JOY script - please open one and/or relaunch the Joy Editor extension.");
    }

    // const settings = new JoyEditorsSettings();

    let provider = new JoyEditorProvider();
    let registration = vscode.workspace.registerTextDocumentContentProvider('joy-editor', provider);
    context.subscriptions.push(registration);

    vscode.workspace.onDidChangeTextDocument((e: vscode.TextDocumentChangeEvent) => {
        console.log(`onDidChangeTextDocument!`);
        // if (e.document === vscode.window.activeTextEditor.document && typeof provider !== 'undefined') {
        // 	provider.update(joyEditorUri);
        // }
    });

    vscode.window.onDidChangeTextEditorSelection((e: vscode.TextEditorSelectionChangeEvent) => {
        console.log(`onDidChangeTextEditorSelection!`);
        if (e.textEditor === vscode.window.activeTextEditor && typeof provider !== 'undefined'
            && e.textEditor.document.fileName.endsWith('joy') && provider.getProviderHtml().trim().startsWith('<body>')) {
            provider.update(joyEditorUri);
        }
    })

    let cmdOpenJoyEditor = vscode.commands.registerCommand('extension.openJoyEditor', () => {
        return vscode.commands.executeCommand(
            'vscode.previewHtml',
            joyEditorUri,
            vscode.ViewColumn.Two
        ).then((success) => {
            console.log(`starting joy editor`)
        }, (reason) => {
            vscode.window.showErrorMessage(reason);
        });
    });
    context.subscriptions.push(cmdOpenJoyEditor, registration);

    // let cmdReloadJoyEditor = vscode.commands.registerCommand('extension.reloadJoyEditor', () => {
    //     if (typeof provider !== 'undefined') {
    //         //TODO: implement on reload command
    //         console.log('reload command...');
    //         // provider.update(joyEditorUri);
    //     }
    // });


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