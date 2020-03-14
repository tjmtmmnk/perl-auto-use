import { readFile } from 'fs';
import * as vscode from 'vscode';

import { DB } from './db';
import { AutoUseRegex } from './autoUseRegex';

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

            const exportMatches = data.match(AutoUseRegex.EXPORT);
            const exportOKMatches = data.match(AutoUseRegex.EXPORT_OK);

            const packageNames = data.match(AutoUseRegex.PACKAGE);
            const packageName = packageNames ? packageNames[0].replace('package ', '').replace(';', '') : '';

            if (exportMatches) {
                const subs: string[] = exportMatches[0]
                    .replace(/@EXPORT(\s*=\s*)qw(\/|\()/, '')
                    .replace(/(\/|\));/, '')
                    .split(/\s/)
                    .filter(s => s !== '');

                subs.forEach(sub => DB.add(sub, packageName, file, workspace));
            }

            if (exportOKMatches) {
                const subs: string[] = exportOKMatches[0]
                    .replace(/@EXPORT_OK(\s*=\s*)qw(\/|\()/, '')
                    .replace(/(\/|\));/, '')
                    .split(/\s/)
                    .filter(s => s !== '');

                subs.forEach(sub => DB.add(sub, packageName, file, workspace));
            }
        });
    }
}