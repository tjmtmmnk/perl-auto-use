import * as vscode from 'vscode';

export interface ImportObject {
    name: string,
    file: vscode.Uri,
    workspace: vscode.WorkspaceFolder
}

export class DB {
    private static imports: Array<ImportObject> = new Array<ImportObject>();

    public static all(): Array<ImportObject> {
        return this.imports;
    }

    public static add(name: string, file: any, workspace: vscode.WorkspaceFolder): void {

        name = name.trim();

        if (name === '' || name.length === 1) return;

        const obj: ImportObject = {
            name,
            file,
            workspace
        }

        const exists = this.imports.findIndex(m => m.name === obj.name && m.file.fsPath === file.fsPath);

        if (exists === -1) {
            this.imports.push(obj);
        }
    }
}