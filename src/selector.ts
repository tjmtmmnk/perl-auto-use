import * as vscode from 'vscode';

import { AutoUseRegex } from './regex';

interface ModuleSubObject {
    packageName: string,
    subList: string[],
}

export class Selector {
    private editor: vscode.TextEditor;

    constructor(private _editor: vscode.TextEditor) {
        this.editor = _editor;
    }

    private getRangesByRegex(regex: RegExp): vscode.Range[] {
        const document = this.editor.document;
        const fullText = document?.getText();

        if (fullText === undefined) { return []; }

        const matches = fullText.matchAll(regex);

        let ranges = new Array<vscode.Range>();
        for (const match of matches) {
            const startIndex = match.index !== undefined ? match.index : 0;
            const endIndex = match.index !== undefined ? match.index + match[0].length : 0;
            const startPosition = this.editor.document.positionAt(startIndex);
            const endPosition = this.editor.document.positionAt(endIndex);
            ranges.push(new vscode.Range(startPosition, endPosition));
        }

        return ranges;
    }

    public getSelectText(): string {
        const document = this.editor.document;
        if (document === undefined) { return ''; }
        return document.getText(this.editor.selection);
    }

    // insert use statement next line of 'package'
    public insertUseStatements(useStatements: string[]): Thenable<boolean> {
        const ranges = this.getRangesByRegex(AutoUseRegex.PACKAGE);

        if (ranges === []) { return Promise.reject(new Error('no package found')); }

        const endPosition = new vscode.Position(ranges[0].end.line + 1, 0);
        return this.editor.edit(e => useStatements.forEach(useStatement => e.insert(endPosition, useStatement + "\n")));
    }

    public getFullyQualifiedModules(): string[] | undefined {
        const document = this.editor.document;
        const fullText = document?.getText().split(/\n|\r\n|\r/);
        const fullyQualifiedModules = fullText?.reduce((results: any[], lineText) => {
            const isLook = lineText.search(AutoUseRegex.PACKAGE) === -1 &&
                lineText.search(AutoUseRegex.USE) === -1;
            if (isLook) {
                // e.g) Hoge::Foo->bar
                const methodModuleMatches = lineText.matchAll(AutoUseRegex.METHOD_MODULE);
                const methodModuleMatch = [...methodModuleMatches][0];
                // e.g) Hoge::Foo::bar
                const subModuleMatches = lineText.matchAll(AutoUseRegex.SUB_MODULE);
                const subModuleMatch = [...subModuleMatches][0];

                if (methodModuleMatch) {
                    const moduleName = methodModuleMatch[0].replace('->', '');
                    results.push(moduleName);
                }
                if (subModuleMatch) {
                    const moduleName = subModuleMatch[1].replace(/::$/, '');
                    results.push(moduleName);
                }
            }
            return results;
        }, []);

        const uniqueFullyQualifiedModules: Set<string> = new Set(fullyQualifiedModules);
        return [...uniqueFullyQualifiedModules].sort();
    }

    public getDeclaredModule(): string[] | undefined {
        const document = this.editor.document;
        const fullText = document?.getText();
        const useMatches = fullText?.match(AutoUseRegex.USE);
        return useMatches?.map(u => u.replace('use ', '').replace(';', ''));
    }

    public getDeclaredModuleSub(): ModuleSubObject[] | undefined {
        const document = this.editor.document;
        const fullText = document?.getText();
        const useSubMatches = fullText?.match(AutoUseRegex.USE_SUB);

        return useSubMatches?.map(u => {
            const packageName = u
                .replace('use ', '')
                .replace(/ qw(\/|\()(\s*\w+\s*)*(\/|\));/, '');

            const subList = u
                .replace(/use [A-Za-z0-9:]+ /, '')
                .replace(/qw(\/|\()/, '')
                .replace(/(\/|\));/, '')
                .split(/\s/)
                .filter(s => s !== '');

            const obj: ModuleSubObject = {
                packageName,
                subList
            };

            return obj;
        });
    }

    public deleteByRegex(regex: RegExp): Thenable<boolean> {
        const ranges = this.getRangesByRegex(regex);

        if (ranges === []) { return Promise.reject('not match'); }

        return this.editor.edit(e => ranges.forEach(range => e.delete(range)));
    }
}