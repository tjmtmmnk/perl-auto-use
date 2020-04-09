import { AutoUseRegex } from './autoUseRegex';
import { AutoUseContext } from './autoUseContext';
import { ImportObject } from './db';
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

    protected async insertUseSubByImportObjects(importObjects: ImportObject[]): Promise<boolean> {
        const packageNameToImportObjects = this.partitionByPackageName(importObjects);

        let useStatements: string[] = [];
        const declaredModuleSub = this.selector.getUseModuleSubs();

        for (const packageName of Object.keys(packageNameToImportObjects)) {
            const alreadyDeclaredModuleSub = declaredModuleSub.filter(dus => dus.packageName === packageName);

            const alreadyDeclaredSubList = alreadyDeclaredModuleSub.length > 0
                ? alreadyDeclaredModuleSub[0].subList
                : [];

            // filter not in alreadyDeclaredSubList beacause of not thinking wheter already declared sublist or not
            const subList: string[] = alreadyDeclaredSubList.length > 0
                ? packageNameToImportObjects[packageName]
                    .filter(io => !alreadyDeclaredSubList.includes(io.name))
                    .map(fio => fio.name)
                    .concat(alreadyDeclaredSubList)
                : packageNameToImportObjects[packageName]
                    .map(io => io.name);

            const useStatement = this.buildUseStatement(packageName, subList.sort());

            if (alreadyDeclaredModuleSub.length > 0) {
                // to remove new line
                const pattern = `use ${packageName}\s*qw\(.*\);(\n|\r\n)`;
                await this.selector.deleteByRegex(RegExp(pattern));
            }
            if (useStatement !== '') {
                useStatements.push(useStatement);
            }
        }
        return this.selector.insertUseStatements(useStatements);
    }

    protected async sortUseStatements() {
        const useStatements = this.selector.getAllUseStatements();
        const ascUseStatements = useStatements.sort();

        // to remove new line
        const pattern = AutoUseRegex.USE_AND_SUB.source + AutoUseRegex.NEW_LINE.source;
        await this.selector.deleteByRegex(RegExp(pattern, 'g'));

        await this.selector.insertUseStatements(ascUseStatements);
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