import * as vscode from 'vscode';

import { Scanner } from './scanner';
import { DB } from './db';
import { Selector } from './selector';

export class Core {
    private workspace: vscode.WorkspaceFolder | undefined;

    constructor(private context: vscode.ExtensionContext) {
        this.workspace = vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0] : undefined;
    }

    private useBuilder(packageName: string, subList: string[] | undefined): string {
        if (subList === undefined) { return 'use ' + packageName + ';'; }
        let subListStr = "";
        for (let i = 0; i < subList.length; i++) {
            subListStr += (i !== subList.length - 1 ? subList[i] + ' ' : subList[i]);
        }
        return 'use ' + packageName + ' qw(' + subListStr + ');';
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

        // select word for use, search for perl library database and insert use statement
        const selectUseCommand = vscode.commands.registerCommand('extension.selectUse', () => {
            const editor = vscode.window.activeTextEditor;

            if (editor === undefined) { return; }

            const selector = new Selector(editor);
            const selectText = selector.getSelectText();
            const importObjects = DB.findByName(selectText);
            if (importObjects) {
                const packageName = importObjects[0].packageName;
                const declaredModuleSub = selector.getDeclaredModuleSub();
                const alreadyDeclaredModuleSub = declaredModuleSub?.filter(dus => dus.packageName === packageName);
                const subList = alreadyDeclaredModuleSub ? alreadyDeclaredModuleSub[0].subList.concat([selectText]) : [selectText];
                const useBuilder = this.useBuilder(packageName, subList);
                if (alreadyDeclaredModuleSub) {
                    const regex = `use ${packageName} qw(\\/|\\()(\\s*\\w+\\s*)*(\\/|\\));`;
                    selector.deleteByRegex(RegExp(regex, 'g'))
                        .then(() => selector.insertUseStatements([useBuilder]));
                }
                selector.insertUseStatements([useBuilder]);
            }
        });

        // search fully qualified subroutines, and insert use statement
        const searchUseCommand = vscode.commands.registerCommand('extension.searchUse', () => {
            const editor = vscode.window.activeTextEditor;

            if (editor === undefined) { return; }

            const selector = new Selector(editor);
            const declaredUse = selector.getDeclaredModule();
            const fullyQualifiedModules = selector.getFullyQualifiedModules();
            const notDeclaredModule = declaredUse === undefined ? fullyQualifiedModules : fullyQualifiedModules?.filter(fqm => !declaredUse?.includes(fqm));
            const useStatements = notDeclaredModule?.map(us => this.useBuilder(us, undefined));

            if (useStatements === undefined) { return; }
            selector.insertUseStatements(useStatements);
        });

        this.context.subscriptions.push(scanCommand, showDBCommand, selectUseCommand, searchUseCommand);
    }
}