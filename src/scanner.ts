import { readFile } from 'fs';
import * as vscode from 'vscode';

import { DB } from './db';

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
                    this.processFile(workspace, file);
                });
            });
    }

    private processFile(workspace: vscode.WorkspaceFolder | undefined, file: vscode.Uri): void {
        readFile(file.fsPath, 'utf-8', (err, data) => {
            if (err) {
                return console.log(err);
            }

            const exportMatches = data.match(/@EXPORT(\s*=\s*)qw(\/|\()(\s*\w+\s*)*(\/|\));/g);
            const exportOKMatches = data.match(/@EXPORT_OK(\s*=\s*)qw(\/|\()(\s*\w+\s*)*(\/|\));/g);

            const packageNames = data.match(/package [A-Za-z0-9:]+;/g);
            const packageName = packageNames ? packageNames[0].replace('package ', '').replace(';', '') : '';

            if (exportMatches) {
                const subs: string[] = exportMatches[0].replace(/@EXPORT(\s*=\s*)qw(\/|\()/, '').replace(/(\/|\));/, '').split(' ');
                subs.forEach(sub => DB.add(sub, packageName, file, workspace));
            }

            if (exportOKMatches) {
                const subs: string[] = exportOKMatches[0].replace(/@EXPORT_OK(\s*=\s*)qw(\/|\()/, '').replace(/(\/|\));/, '').split(' ');
                subs.forEach(sub => DB.add(sub, packageName, file, workspace));
            }
        });
    }
}