import * as vscode from 'vscode';

import { AutoUse } from './autoUse';
import { AutoUseContext } from './autoUseContext';
import { DB } from './db';
import { Scanner } from './scanner';
import { SelectUse } from './selectUse';

export class Core {
    private workspace: vscode.WorkspaceFolder | undefined;

    constructor(private context: AutoUseContext) {
        this.workspace = vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0] : undefined;
    }

    public attatchCommands(): void {
        const selectUseAction = vscode.languages.registerCodeActionsProvider('perl', new SelectUse(this.context), {
            providedCodeActionKinds: SelectUse.providedCodeActionKinds
        });

        const scanCommand = vscode.commands.registerCommand('extension.scanFiles', () => {
            const scanner = new Scanner(this.context, vscode.workspace.getConfiguration('autouse'));
            scanner.scan(this.workspace);
            vscode.window.showInformationMessage('Scan done!!');
        });

        const showDBCommand = vscode.commands.registerCommand('extension.showDB', () => {
            console.log(DB.all());
        });

        const autoUseCommand = vscode.commands.registerCommand('extension.autoUse', () => {
            const editor = vscode.window.activeTextEditor;

            if (editor === undefined) { return; }

            const autoUse = new AutoUse(this.context);

            autoUse.insertModules();
        });

        this.context.extensionContext.subscriptions.push(scanCommand, showDBCommand, autoUseCommand, selectUseAction);
    }
}