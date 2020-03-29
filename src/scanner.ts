import * as vscode from 'vscode';

import { AutoUseContext } from './autoUseContext';
import { AutoUseRegex } from './autoUseRegex';
import { ImportObject, DB } from './db';
import { readFile } from 'fs';

export class Scanner {
    private filesToScan: string;

    constructor(private context: AutoUseContext) {
        this.filesToScan = this.context.config.get<string>('filesToScan', '**/lib/**/*.pm');
    }

    public async scan(): Promise<void> {
        const scanLocations: vscode.GlobPattern[] = this.filesToScan
            .split(' ')
            .map(fts =>
                this.context.workspace === undefined ? fts : new vscode.RelativePattern(this.context.workspace, fts)
            );

        await Promise.all(scanLocations.map(async sl => {
            const files = await vscode.workspace.findFiles(sl, null, 99999);

            await Promise.all(files.map(async file => {
                const objects: ImportObject[] = await this.extractExportFunctions(file).catch(e => Promise.reject(e));
                await Promise.all(objects.map(async obj => {
                    await DB.add(obj.name, obj.packageName, obj.file, obj.workspace);
                }));
            }));
        }));

        return Promise.resolve();
    }

    private async extractExportFunctions(file: vscode.Uri) {
        return new Promise<any>((resolve, reject) => {
            readFile(file.fsPath, 'utf-8', (err, data) => {
                if (err) {
                    reject(err);
                }

                const packageNames = [...data.matchAll(AutoUseRegex.PACKAGE)];

                if (packageNames.length === 0) {
                    return reject(`package name is not found in ${file}`);
                }

                const packageName = packageNames[0][1];

                const exportMatches = [...data.matchAll(AutoUseRegex.EXPORT)];
                const exportOKMatches = [...data.matchAll(AutoUseRegex.EXPORT_OK)];
                const exportPublicSubMatches = [...data.matchAll(AutoUseRegex.GET_PUBLIC_FUNCTIONS)];

                let importObjects: ImportObject[] = [];
                if (exportMatches.length > 0) {
                    const subs: string[] = exportMatches[0][3].split(/\s/);
                    subs.forEach(sub => {
                        const object: ImportObject = {
                            name: sub,
                            packageName: packageName,
                            file: file,
                            workspace: this.context.workspace
                        };
                        importObjects.push(object);
                    });
                }

                if (exportOKMatches.length > 0) {
                    const subs: string[] = exportOKMatches[0][3].split(/\s/);
                    subs.forEach(sub => {
                        const object: ImportObject = {
                            name: sub,
                            packageName: packageName,
                            file: file,
                            workspace: this.context.workspace
                        };
                        importObjects.push(object);
                    });
                }

                if (exportPublicSubMatches.length > 0) {
                    const subMatches = [...data.matchAll(AutoUseRegex.SUB_DECLARE)];
                    const subs: string[] = subMatches.map(sm => sm[1]);
                    subs.forEach(sub => {
                        const object: ImportObject = {
                            name: sub,
                            packageName: packageName,
                            file: file,
                            workspace: this.context.workspace
                        };
                        importObjects.push(object);
                    });
                }

                resolve(importObjects);
            });
        });
    }
}