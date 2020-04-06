import * as vscode from 'vscode';

import { AutoUseRegex } from './autoUseRegex';
import { DB } from './db';
import { UseBuilder } from './useBuilder';

export class AutoUse extends UseBuilder {
    private async insertFullyQualifiedModule(): Promise<boolean> {
        const declaredModules = this.selector.getAllModules();
        const fullyQualifiedModules = this.selector.getFullyQualifiedModules();

        const notDeclaredModule = declaredModules.length > 0
            ? fullyQualifiedModules
            : fullyQualifiedModules.filter(fqm => !declaredModules.includes(fqm));

        const useStatements = notDeclaredModule.map(us => this.buildUseStatement(us, undefined));

        return this.selector.insertUseStatements(useStatements);
    }

    private async insertLibraryModule(): Promise<boolean> {
        const fullText = this.selector.getFullText();

        const tokensInFullText = fullText
            .replace(AutoUseRegex.COMMENT, '')
            .split(AutoUseRegex.DELIMITER)
            .filter(s => s !== '') // guarantee the order hash_key => xxx
            .filter((token, idx, arr) =>
                idx + 1 < arr.length &&
                arr[idx + 1] !== '=>' &&
                RegExp(AutoUseRegex.EXACT_MATCH_WORD_LOWER_CASE).test(token) && // This filter variable symbol $@%
                !RegExp(AutoUseRegex.DECLARE).test(token)
            );

        const uniqueTokensInFullText = new Set<string>(tokensInFullText);
        const importObjects = [...uniqueTokensInFullText]
            .map(ut => DB.findByName(ut));

        const declaredModuleSub = this.selector.getModuleSubs();
        const alreadyDeclaredSubList = declaredModuleSub.flatMap(dms => dms.subList);

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
        await this.selector.deleteAllUseStatements();
        await this.insertFullyQualifiedModule();
        await this.insertLibraryModule();
        await this.sortUseStatements();
    }
}