import * as vscode from 'vscode';

import { AutoUseContext } from './autoUseContext';
import { AutoUseRegex } from './autoUseRegex';
import { ImportObject, DB } from './db';
import { promises as fs } from 'fs';

export class Scanner {
    private filesToScan: string;

    constructor(private context: AutoUseContext) {
        this.filesToScan = this.context.config.get<string>('filesToScan', '**/lib/**/*.pm');
    }

    public async scan(): Promise<void> {
        const scanLocations: vscode.GlobPattern[] = this.filesToScan
            .split(' ')
            .map(fts =>
                this.context.workspace === undefined
                    ? fts
                    : new vscode.RelativePattern(this.context.workspace, fts)
            );

        let addObjects: [ImportObject[]] = [[]];
        await Promise.all(
            scanLocations.map(async sl => {
                const files = await vscode.workspace.findFiles(sl, null, 99999);
                await Promise.all(
                    files.map(async file => {
                        const objects: ImportObject[] = await this.extractExportFunctions(file).catch(e => Promise.reject(e));
                        if (objects.length > 0) {
                            addObjects.push(objects);
                        }
                    })
                );
            })
        );

        await Promise.all(
            addObjects.flat(1).map(async obj => {
                await DB.add(obj.name, obj.packageName, obj.file, obj.workspace);
            })
        );

        return Promise.resolve();
    }

    private async extractExportFunctions(file: vscode.Uri): Promise<ImportObject[]> {
        const data = await fs.readFile(file.fsPath, 'utf-8').catch(e => Promise.reject(e));

        const packageNames = [...data.matchAll(AutoUseRegex.PACKAGE)];

        if (packageNames.length === 0) {
            return Promise.resolve([]);
        }

        const packageName = packageNames[0][1];

        let importObjects: ImportObject[] = [];

        const pushSubs = (subs: string[]) => {
            subs.forEach(sub => {
                const object: ImportObject = {
                    name: sub,
                    packageName: packageName,
                    file: file,
                    workspace: this.context.workspace
                };
                importObjects.push(object);
            });
        };

        const exportPublicSubMatches = [...data.matchAll(AutoUseRegex.GET_PUBLIC_FUNCTIONS)];

        // make exclusive to avoid duplicate
        if (exportPublicSubMatches.length > 0) {
            const subMatches = [...data.matchAll(AutoUseRegex.SUB_DECLARE)];
            const subs: string[] = subMatches.map(sm => sm[1]);
            pushSubs(subs);
        } else {
            const exportMatches = [...data.matchAll(AutoUseRegex.EXPORT)];
            const exportOKMatches = [...data.matchAll(AutoUseRegex.EXPORT_OK)];

            if (exportMatches.length > 0) {
                const subs: string[] = exportMatches[0][1].replace(/qw(\(|\/)/, '').replace(/(\)|\/)/, '').split(/\s/).filter(s => s !== '');
                pushSubs(subs);
            }

            if (exportOKMatches.length > 0) {
                const subs: string[] = exportOKMatches[0][1].replace(/qw(\(|\/)/, '').replace(/(\)|\/)/, '').split(/\s/).filter(s => s !== '');
                pushSubs(subs);
            }
        }

        return Promise.resolve(importObjects);
    }
}