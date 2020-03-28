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

    public static deleteAll(): ImportObject[] {
        this.imports.length = 0;
        return this.imports;
    }

    public static add(name: string, packageName: string, file: vscode.Uri, workspace: vscode.WorkspaceFolder | undefined): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            name = name.trim();

            if (name === '' || name.length === 1) { reject('can not resolve name'); }

            const obj: ImportObject = {
                name,
                packageName,
                file,
                workspace
            };

            const exist = this.imports.findIndex(m => m.name === name && m.packageName === packageName && m.file.fsPath === file.fsPath) !== -1;

            if (exist) {
                reject('alredy exist');
            } else {
                this.imports.push(obj);
                resolve('added');
            }
        });
    }

    public static findByName(name: string): ImportObject[] {
        return this.imports.filter(obj => obj.name === name);
    }
}