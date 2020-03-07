import * as vscode from 'vscode';

import { Scanner } from './scanner';
import { DB } from './db';
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

        const selectUseCommand = vscode.commands.registerCommand('extension.selectUse', () => {
            const selector = new Selector();
            selector.insertUseSelection('waaa');
        });

        this.context.subscriptions.push(scanCommand, showDBCommand, selectUseCommand);
    }
}