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

    public static deleteAll(): void {
        this.imports.splice(0);
    }

    public static add(name: string, packageName: string, file: vscode.Uri, workspace: vscode.WorkspaceFolder | undefined): Promise<boolean> {
        return new Promise<boolean>((resolve) => {
            name = name.trim();

            if (name === '') { resolve(false); }

            const obj: ImportObject = {
                name,
                packageName,
                file,
                workspace
            };

            const exist = this.imports.findIndex(m =>
                m.name === name &&
                m.packageName === packageName &&
                m.file.fsPath === file.fsPath
            ) !== -1;

            if (exist) {
                resolve(false);
            } else {
                this.imports.push(obj);
                resolve(true);
            }
        });
    }

    public static findByName(name: string): ImportObject[] {
        return this.imports.filter(obj => obj.name === name);
    }
}