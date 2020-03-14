import { AutoUseRegex } from './autoUseRegex';
import { DB } from './db';
import { Selector } from './selector';

export class AutoUse {
    private selector: Selector;

    constructor(private _selector: Selector) {
        this.selector = _selector;
    }

    private useBuilder(packageName: string, subList: string[] | undefined): string {
        if (subList === undefined) { return 'use ' + packageName + ';'; }
        let subListStr = "";
        for (let i = 0; i < subList.length; i++) {
            subListStr += (i !== subList.length - 1 ? subList[i] + ' ' : subList[i]);
        }
        return 'use ' + packageName + ' qw(' + subListStr + ');';
    }

    public insertUseStatementByName(name: string): void {
        const importObjects = DB.findByName(name);
        if (importObjects.length > 0) {
            const packageName = importObjects[0].packageName;
            const declaredModuleSub = this.selector.getDeclaredModuleSub();
            const alreadyDeclaredModuleSub = declaredModuleSub?.filter(dus => dus.packageName === packageName);
            const subList = alreadyDeclaredModuleSub ? alreadyDeclaredModuleSub[0].subList.concat([name]) : [name];
            const useBuilder = this.useBuilder(packageName, subList);
            if (alreadyDeclaredModuleSub) {
                const regex = `use ${packageName} qw(\\/|\\()(\\s*\\w+\\s*)*(\\/|\\));`;
                this.selector.deleteByRegex(RegExp(regex, 'g'))
                    .then(() => this.selector.insertUseStatements([useBuilder]));
            }
            this.selector.insertUseStatements([useBuilder]);
        }
    }

    public insertUseStatementsBySearch(): void {
        const declaredUse = this.selector.getDeclaredModule();
        const fullyQualifiedModules = this.selector.getFullyQualifiedModules();
        const notDeclaredModule = declaredUse === undefined ? fullyQualifiedModules : fullyQualifiedModules?.filter(fqm => !declaredUse?.includes(fqm));
        const useStatements = notDeclaredModule?.map(us => this.useBuilder(us, undefined));

        if (useStatements === undefined) { return; }
        this.selector.insertUseStatements(useStatements);
    }

    public insertUseStatementsBySplit(): void {
        const fullText = this.selector.getFullText();

        const tokensInFullText = fullText
            .split(AutoUseRegex.DELIMITER)
            .filter(token =>
                RegExp(AutoUseRegex.EXACT_MATCH_WORD_LOWER_CASE).test(token) && // This filter variable symbol $@%
                !RegExp(AutoUseRegex.DECLARE).test(token)
            );

        const uniqueTokensInFullText = new Set<string>(tokensInFullText);
        for (const token of uniqueTokensInFullText) {
            this.insertUseStatementByName(token);
        }
    }
}