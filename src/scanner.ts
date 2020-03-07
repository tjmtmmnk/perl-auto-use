import * as FS from 'fs';
import * as vscode from 'vscode';

import { DB } from './db';

export class Scanner {
    private filesToScan: string;

    constructor(private config: vscode.WorkspaceConfiguration) {
        this.filesToScan = this.config.get<string>('filesToScan', '**/lib/**');
    }

    public scan(workspace: vscode.WorkspaceFolder | undefined) {
        const scanLocation: vscode.GlobPattern = workspace === undefined ? this.filesToScan : new vscode.RelativePattern(workspace, this.filesToScan);
        console.log(scanLocation);

        vscode.workspace
            .findFiles(scanLocation, null, 99999)
            .then(uriList => {
                console.log(uriList);
                uriList.forEach(uri => {
                    this.processFile(workspace, uri);
                });
            });
    }

    private processFile(workspace: vscode.WorkspaceFolder | undefined, file: vscode.Uri): void {
        FS.readFile(file.fsPath, 'utf-8', (err, data) => {
            if (err) {
                return console.log(err);
            }

            const exportMatches = data.match(/our @EXPORT(\s*=\s*)qw(\/|\()(\s*\w+\s*)*(\/|\));/g);
            const exportOKMatches = data.match(/our @EXPORT_OK(\s*=\s*)qw(\/|\()(\s*\w+\s*)*(\/|\));/g);

            if (exportMatches) {
                const subs: string[] = exportMatches[0].replace(/our @EXPORT(\s*=\s*)qw(\/|\()/, '').replace(/(\/|\));/, '').split(/\s*/g);
                subs.forEach(sub => DB.add(sub, file, workspace));
            }

            if (exportOKMatches) {
                const subs: string[] = exportOKMatches[0].replace(/our @EXPORT_OK(\s*=\s*)qw(\/|\()/, '').replace(/(\/|\));/, '').split(/\s*/g);
                subs.forEach(sub => DB.add(sub, file, workspace));
            }
        });
    }
}