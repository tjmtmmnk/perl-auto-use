import * as vscode from 'vscode';

import { AutoUseRegex } from './autoUseRegex';

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
        const fullText = this.getFullText();

        if (fullText === '') { return []; }

        const matches = fullText.matchAll(regex);

        return [...matches].reduce((ranges: vscode.Range[], match) => {
            const startIndex = match.index !== undefined ? match.index : 0;
            const endIndex = match.index !== undefined ? match.index + match[0].length : 0;
            const startPosition = this.editor.document.positionAt(startIndex);
            const endPosition = this.editor.document.positionAt(endIndex);
            ranges.push(new vscode.Range(startPosition, endPosition));
            return ranges;
        }, []);
    }

    public getFullText(): string {
        return this.editor.document.getText();
    }

    public getSelectText(): string {
        const document = this.editor.document;
        if (document === undefined) { return ''; }
        return document.getText(this.editor.selection);
    }

    // insert use statement next line of 'package'
    public async insertUseStatements(useStatements: string[]): Promise<boolean> {
        const ranges = this.getRangesByRegex(AutoUseRegex.PACKAGE);

        if (ranges === []) { return Promise.reject(new Error('no package found')); }

        const endPosition = new vscode.Position(ranges[0].end.line + 1, 0);
        return this.editor.edit(e => useStatements.forEach(useStatement => e.insert(endPosition, useStatement + "\n")));
    }

    public getFullyQualifiedModules(): string[] | undefined {
        const fullText = this.getFullText();
        const fullTextSplittedByNewLine = fullText.split(/\n|\r\n|\r/);

        const fullyQualifiedModules = fullTextSplittedByNewLine?.reduce((modules: string[], lineText) => {
            const isLook = lineText.search(AutoUseRegex.PACKAGE) === -1 &&
                lineText.search(AutoUseRegex.USE) === -1;
            if (isLook) {
                const methodModuleMatches = lineText.matchAll(AutoUseRegex.METHOD_MODULE);
                const methodModuleMatch = [...methodModuleMatches][0];

                const subModuleMatches = lineText.matchAll(AutoUseRegex.SUB_MODULE);
                const subModuleMatch = [...subModuleMatches][0];

                if (methodModuleMatch) {
                    const moduleName = methodModuleMatch[0].replace('->', '');
                    modules.push(moduleName);
                }
                if (subModuleMatch) {
                    const moduleName = subModuleMatch[1].replace(/::$/, '');
                    modules.push(moduleName);
                }
            }
            return modules;
        }, []);

        const uniqueFullyQualifiedModules: Set<string> = new Set(fullyQualifiedModules);
        return [...uniqueFullyQualifiedModules].sort();
    }

    public getDeclaredModule(): string[] | undefined {
        const fullText = this.getFullText();
        const useMatches = fullText.match(AutoUseRegex.USE);
        return useMatches?.map(u => u.replace('use ', '').replace(';', ''));
    }

    public getDeclaredModuleSub(): ModuleSubObject[] | undefined {
        const fullText = this.getFullText();
        const useSubMatches = fullText.match(AutoUseRegex.USE_SUB);

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

    public async deleteByRegex(regex: RegExp): Promise<boolean> {
        const ranges = this.getRangesByRegex(regex);

        if (ranges === []) { return Promise.reject('not match'); }

        return this.editor.edit(e => ranges.forEach(range => e.delete(range)));
    }
}