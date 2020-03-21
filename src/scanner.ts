import * as vscode from 'vscode';

import { AutoUseRegex } from './autoUseRegex';
import { DB } from './db';
import { readFile } from 'fs';

export class Scanner {
    private filesToScan: string;

    constructor(private config: vscode.WorkspaceConfiguration) {
        this.filesToScan = this.config.get<string>('filesToScan', '**/lib/**/*.pm');
    }

    public scan(workspace: vscode.WorkspaceFolder | undefined): void {
        const scanLocation: vscode.GlobPattern = workspace === undefined ? this.filesToScan : new vscode.RelativePattern(workspace, this.filesToScan);

        vscode.workspace.findFiles(scanLocation, null, 99999)
            .then(files => {
                files.forEach(file => {
                    this.extractExportFunctions(workspace, file);
                });
            });
    }

    private extractExportFunctions(workspace: vscode.WorkspaceFolder | undefined, file: vscode.Uri): void {
        readFile(file.fsPath, 'utf-8', (err, data) => {
            if (err) {
                return console.log(err);
            }

            const packageNames = [...data.matchAll(AutoUseRegex.PACKAGE)];

            if (packageNames === undefined) {
                console.log("package name is not found");
                return;
            }

            const packageName = packageNames[0][1];

            const exportMatches = [...data.matchAll(AutoUseRegex.EXPORT)];
            const exportOKMatches = [...data.matchAll(AutoUseRegex.EXPORT_OK)];
            const exportPublicSubMatches = [...data.matchAll(AutoUseRegex.GET_PUBLIC_FUNCTIONS)];

            if (exportMatches.length > 0) {
                const subs: string[] = exportMatches[0][3].split(/\s/);
                subs.forEach(sub => DB.add(sub, packageName, file, workspace));
            }

            if (exportOKMatches.length > 0) {
                const subs: string[] = exportOKMatches[0][3].split(/\s/);
                subs.forEach(sub => DB.add(sub, packageName, file, workspace));
            }

            if (exportPublicSubMatches.length > 0) {
                const subMatches = [...data.matchAll(AutoUseRegex.SUB_DECLARE)];
                const subs: string[] = subMatches.map(sm => sm[1]);
                subs.forEach(sub => DB.add(sub, packageName, file, workspace));
            }
        });
    }
}