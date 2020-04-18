import * as vscode from 'vscode';

import { AutoUseRegex } from './autoUseRegex';

import { DB } from './db';
import { UseBuilder } from './useBuilder';

export class AutoUse extends UseBuilder {
    private async insertFullyQualifiedModule(): Promise<boolean> {
        // check simple use and use-sub
        const declaredModules = this.selector.getAllModules();

        const fullyQualifiedModules = this.selector.getFullyQualifiedModules();

        const notDeclaredModule = fullyQualifiedModules
            .filter(fqm => !declaredModules.includes(fqm.packageName))
            .sort((a, b) => a.packageName > b.packageName ? 1 : -1)
            .map(ms => ms.packageName);

        const useStatements = [... new Set<string>(notDeclaredModule)]
            .map(module => this.buildUseStatement(module, undefined));

        if (useStatements === undefined) { return Promise.reject('some error'); }

        return this.selector.insertUseStatements(useStatements);
    }

    private async insertLibraryModule(): Promise<boolean> {
        const fullText = this.selector.getFilteredFullText();

        const tokensInFullText = fullText
            .split(AutoUseRegex.DELIMITER)
            .filter(s => s !== '') // guarantee the order hash_key => xxx
            .filter((token, idx, arr) =>
                idx + 1 < arr.length &&
                arr[idx + 1] !== '=>' &&
                RegExp(AutoUseRegex.EXACT_MATCH_WORD_LOWER_CASE).test(token) && // This filter variable symbol $@%
                !RegExp(AutoUseRegex.EXACT_MATCH_WORD_DECLARE).test(token)
            );

        const declaredModules = this.selector.getUseModules();

        const importObjectsByToken = [... new Set<string>(tokensInFullText)]
            .map(ut => DB.findByName(ut));

        const fullyQualifiedModules = this.selector.getFullyQualifiedModules();

        // e.g) JSON::Types::number must be belong to JSON::Types
        const importObjectsByFunctions = fullyQualifiedModules
            .map(fqm => {
                const objects = DB.findByName(fqm.sub);
                const filteredObjects = objects.filter(object => object.packageName === fqm.packageName);
                return filteredObjects;
            });

        const importObjects = importObjectsByToken.concat(importObjectsByFunctions);

        const alreadyDeclaredSubList = this.selector.getUseModuleSubs().flatMap(ums => ums.subList);

        // delete simple use if use-sub is exist
        await (async () => {
            for (const dm of declaredModules) {
                const includedInImports = importObjects.flat(1).map(io => io.packageName).includes(dm);
                if (includedInImports) {
                    const pattern = `use ${dm};` + AutoUseRegex.NEW_LINE.source;
                    await this.selector.deleteByRegex(RegExp(pattern));
                }
            }
        })();

        const notDuplicateImportObjects = importObjects
            .filter(objects => objects.length === 1)
            .flat(1);

        const duplicateImportObjects = importObjects
            .filter(objects => objects.length > 1)
            .flat(1);

        duplicateImportObjects.forEach(dio => {
            if (!alreadyDeclaredSubList.includes(dio.name)) {
                vscode.window.showWarningMessage(`${dio.name} is duplicated. Please solve individually`);
            }
        });

        return this.insertUseSubByImportObjects(notDuplicateImportObjects);
    }

    public async insertModules(): Promise<void> {
        await this.insertFullyQualifiedModule();
        await this.insertLibraryModule();
        await this.sortUseStatements();
    }
}
