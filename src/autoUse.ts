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

    private async insertUseStatementByNames(names: string[]): Promise<boolean> {
        let useStatements: string[] = [];
        const declaredModuleSub = this.selector.getDeclaredModuleSub();

        for (const name of names) {
            const importObjects = DB.findByName(name);

            if (importObjects.length > 0) {
                const packageName = importObjects[0].packageName;
                const alreadyDeclaredModuleSub = declaredModuleSub?.filter(dus => dus.packageName === packageName);
                const alreadyDeclaredSubList = alreadyDeclaredModuleSub ? alreadyDeclaredModuleSub[0].subList : [];
                const subList = alreadyDeclaredSubList.length > 0
                    ? (alreadyDeclaredSubList.includes(name)
                        ? alreadyDeclaredSubList
                        : [...alreadyDeclaredSubList, name])
                    : [name];
                const useStatement = this.useBuilder(packageName, subList);
                if (alreadyDeclaredModuleSub !== undefined) {
                    const regex = `use ${packageName} qw(\\/|\\()(\\s*\\w+\\s*)*(\\/|\\));\n|\r\n|\r`;
                    await this.selector.deleteByRegex(RegExp(regex, 'g'));
                }
                if (useStatement !== '') {
                    useStatements.push(useStatement);
                }
            }
        }
        return this.selector.insertUseStatements(useStatements);
    }

    private async insertFullyQualifiedModule(): Promise<boolean> {
        const declaredUse = this.selector.getDeclaredModule();
        const fullyQualifiedModules = this.selector.getFullyQualifiedModules();
        const notDeclaredModule = declaredUse === undefined ? fullyQualifiedModules : fullyQualifiedModules?.filter(fqm => !declaredUse?.includes(fqm));
        const useStatements = notDeclaredModule?.map(us => this.useBuilder(us, undefined));

        if (useStatements === undefined) { return Promise.reject('some error'); }
        return this.selector.insertUseStatements(useStatements);
    }

    private async insetLibraryModule(): Promise<boolean> {
        const fullText = this.selector.getFullText();

        const tokensInFullText = fullText
            .replace(/ +/, ' ')
            .split(AutoUseRegex.DELIMITER)
            .filter(s => s !== '') // guarantee the order hash_key => xxx
            .filter((token, idx, arr) =>
                idx + 1 < arr.length &&
                arr[idx + 1] !== '=>' &&
                RegExp(AutoUseRegex.EXACT_MATCH_WORD_LOWER_CASE).test(token) && // This filter variable symbol $@%
                !RegExp(AutoUseRegex.DECLARE).test(token)
            );

        const uniqueTokensInFullText = new Set<string>(tokensInFullText);
        return this.insertUseStatementByNames([...uniqueTokensInFullText]);
    }

    public async insertModules(): Promise<void> {
        await this.insertFullyQualifiedModule();
        await this.insetLibraryModule();
    }
}