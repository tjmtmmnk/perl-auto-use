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

    protected async insertUseStatementByImportObjects(importObjects: ImportObject[]): Promise<boolean> {
        const packageNameToImportObjects = this.partitionByPackageName(importObjects);

        let useStatements: string[] = [];
        const declaredModuleSub = this.selector.getDeclaredModuleSub();

        for (const packageName of Object.keys(packageNameToImportObjects)) {
            const alreadyDeclaredModuleSub = declaredModuleSub?.filter(dus => dus.packageName === packageName);
            const alreadyDeclaredSubList = alreadyDeclaredModuleSub?.length ? alreadyDeclaredModuleSub[0].subList : [];
            // filter not in alreadyDeclaredSubList beacause of not thinking wheter already declared sublist or not
            const subList: string[] = alreadyDeclaredSubList.length > 0
                ? packageNameToImportObjects[packageName]
                    .filter(io => !alreadyDeclaredSubList.includes(io.name))
                    .map(fio => fio.name)
                    .concat(alreadyDeclaredSubList)
                : packageNameToImportObjects[packageName].map(io => io.name);

            const useStatement = this.buildUseStatement(packageName, subList);
            if (alreadyDeclaredModuleSub?.length) {
                const regex = `use ${packageName} qw(\\/|\\()(\\s*\\w+\\s*)*(\\/|\\));\n|\r\n|\r`;
                await this.selector.deleteByRegex(RegExp(regex));
            }
            if (useStatement !== '') {
                useStatements.push(useStatement);
            }
        }
        return this.selector.insertUseStatements(useStatements);
    }

    private partitionByPackageName(objects: ImportObject[]) {
        let ret: { [index: string]: ImportObject[] } = {};
        for (const object of objects) {
            ret[object.packageName] = [];
        }
        for (const object of objects) {
            ret[object.packageName].push(object);
        }
        return ret;
    }
}