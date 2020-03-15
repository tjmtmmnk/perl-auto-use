import * as vscode from 'vscode';

import { AutoUse } from './autoUse';
import { DB } from './db';
import { Scanner } from './scanner';
import { Selector } from './selector';

export class Core {
    private workspace: vscode.WorkspaceFolder | undefined;

    constructor(private context: vscode.ExtensionContext) {
        this.workspace = vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0] : undefined;
    }

    public attatchCommands(): void {
        const scanCommand = vscode.commands.registerCommand('extension.scanFiles', () => {
            vscode.window.showInformationMessage('Hello World!');
            const scanner = new Scanner(vscode.workspace.getConfiguration('autouse'));
            scanner.scan(this.workspace);
        });

        const showDBCommand = vscode.commands.registerCommand('extension.showDB', () => {
            console.log(DB.all());
        });

        const autoUseCommand = vscode.commands.registerCommand('extension.autoUse', () => {
            const editor = vscode.window.activeTextEditor;

            if (editor === undefined) { return; }

            const selector = new Selector(editor);
            const autoUse = new AutoUse(selector);
            autoUse.insertModules();
        });

        this.context.subscriptions.push(scanCommand, showDBCommand, autoUseCommand);
    }
}