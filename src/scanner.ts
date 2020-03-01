import * as FS from 'fs';
import * as vscode from 'vscode';

import { DB } from './db';

export class Scanner {
    public scan() {
    }

    private processWorkSpaceFiles(files: vscode.Uri[]): void {
        files.forEach(file => {
            const workspace: vscode.WorkspaceFolder = vscode.workspace.getWorkspaceFolder(file);
            this.processFile(file, workspace);
        });
    }

    private processFile(file: vscode.Uri, workspace: vscode.WorkspaceFolder): void {
        FS.readFile(file.fsPath, 'utf-8', (err, data) => {
            if (err) return console.log(err);

            const exportMatches = data.match(/our @EXPORT(\s*=\s*)qw(\/|\()(\s*\w+\s*)*(\/|\));/g);
            const exportOKMatches = data.match(/our @EXPORT_OK(\s*=\s*)qw(\/|\()(\s*\w+\s*)*(\/|\));/g);

            if (exportMatches) {
                const subs: string[] = exportMatches[0].replace(/our @EXPORT(\s*=\s*)qw(\/|\(/, '').replace(/(\/|\);/, '').split(/\s*/);
                subs.forEach(sub => DB.add(sub, file, workspace));
            }

            if (exportOKMatches) {
                const subs: string[] = exportOKMatches[0].replace(/our @EXPORT_OK(\s*=\s*)qw(\/|\(/, '').replace(/(\/|\);/, '').split(/\s*/);
                subs.forEach(sub => DB.add(sub, file, workspace));
            }
        });
    }
}