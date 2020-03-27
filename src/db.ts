import * as vscode from 'vscode';

export interface ImportObject {
    name: string,
    packageName: string,
    file: vscode.Uri,
    workspace: vscode.WorkspaceFolder | undefined
}

export class DB {
    private static imports: ImportObject[] = new Array<ImportObject>();

    public static all(): ImportObject[] {
        return this.imports;
    }

    public static add(name: string, packageName: string, file: vscode.Uri, workspace: vscode.WorkspaceFolder | undefined): void {

        name = name.trim();

        if (name === '' || name.length === 1) { return; }

        const obj: ImportObject = {
            name,
            packageName,
            file,
            workspace
        };

        const exists = this.imports.findIndex(m => m.name === name && m.packageName === packageName && m.file.fsPath === file.fsPath);

        if (exists === -1) {
            this.imports.push(obj);
        }
    }

    public static findByName(name: string): ImportObject[] {
        return this.imports.filter(obj => obj.name === name);
    }
}