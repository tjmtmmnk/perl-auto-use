import { ImportObject } from './db';

import { AutoUseContext } from './autoUseContext';
import { Selector } from './selector';

export class UseBuilder {
    protected selector: Selector;

    constructor(protected context: AutoUseContext) {
        this.selector = new Selector(context);
    }

    protected buildUseStatement(packageName: string, subList: string[] | undefined): string {
        if (subList === undefined) { return 'use ' + packageName + ';'; }

        let subListStr = "";
        for (let i = 0; i < subList.length; i++) {
            subListStr += (i !== subList.length - 1 ? subList[i] + ' ' : subList[i]);
        }
        return 'use ' + packageName + ' qw(' + subListStr + ');';
    }

    public async insertUseStatementByImportObjects(importObjects: ImportObject[]): Promise<boolean> {
        let useStatements: string[] = [];
        const declaredModuleSub = this.selector.getDeclaredModuleSub();

        for (const object of importObjects) {
            const packageName = object.packageName;
            const subName = object.name;
            const alreadyDeclaredModuleSub = declaredModuleSub?.filter(dus => dus.packageName === packageName);
            const alreadyDeclaredSubList = alreadyDeclaredModuleSub?.length ? alreadyDeclaredModuleSub[0].subList : [];
            const subList = alreadyDeclaredSubList.length > 0
                ? (alreadyDeclaredSubList.includes(subName)
                    ? alreadyDeclaredSubList
                    : [...alreadyDeclaredSubList, subName])
                : [subName];
            const useStatement = this.buildUseStatement(packageName, subList);
            if (alreadyDeclaredModuleSub !== undefined) {
                const regex = `use ${packageName} qw(\\/|\\()(\\s*\\w+\\s*)*(\\/|\\));\n|\r\n|\r`;
                await this.selector.deleteByRegex(RegExp(regex));
            }
            if (useStatement !== '') {
                useStatements.push(useStatement);
            }
        }
        return this.selector.insertUseStatements(useStatements);
    }
}