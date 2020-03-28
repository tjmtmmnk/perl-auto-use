import * as vscode from 'vscode';

import { AutoUse } from './autoUse';
import { AutoUseContext } from './autoUseContext';
import { DB } from './db';
import { Scanner } from './scanner';
import { SelectUse } from './selectUse';

export class Core {
    constructor(private context: AutoUseContext) { }

    public attatchCommands(): void {
        const scanCommand = vscode.commands.registerCommand('extension.scanFiles', () => {
            const scanner = new Scanner(this.context);

            scanner.scan();
            vscode.window.showInformationMessage('Scan done!!');
        });

        const showDBCommand = vscode.commands.registerCommand('extension.showDB', () => {
            console.log(DB.all());
        });

        const autoUseCommand = vscode.commands.registerCommand('extension.autoUse', () => {
            const editor = vscode.window.activeTextEditor;

            if (editor !== undefined) {
                this.context.editor = editor;
            }

            const autoUse = new AutoUse(this.context);

            autoUse.insertModules();
        });

        const selectUseAction = vscode.languages.registerCodeActionsProvider('perl', new SelectUse(this.context), {
            providedCodeActionKinds: SelectUse.providedCodeActionKinds
        });

        this.context.extensionContext.subscriptions.push(scanCommand, showDBCommand, autoUseCommand, selectUseAction);
    }
}