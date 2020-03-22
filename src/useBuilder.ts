import { DB } from './db';
import { Selector } from './selector';

export class UseBuilder {
    protected selector: Selector;

    constructor(private _selector: Selector) {
        this.selector = _selector;
    }

    protected buildUseStatement(packageName: string, subList: string[] | undefined): string {
        if (subList === undefined) { return 'use ' + packageName + ';'; }

        let subListStr = "";
        for (let i = 0; i < subList.length; i++) {
            subListStr += (i !== subList.length - 1 ? subList[i] + ' ' : subList[i]);
        }
        return 'use ' + packageName + ' qw(' + subListStr + ');';
    }

    protected async insertUseStatementByNames(names: string[]): Promise<boolean> {
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
                const useStatement = this.buildUseStatement(packageName, subList);
                if (alreadyDeclaredModuleSub !== undefined) {
                    const regex = `use ${packageName} qw(\\/|\\()(\\s*\\w+\\s*)*(\\/|\\));\n|\r\n|\r`;
                    await this.selector.deleteByRegex(RegExp(regex));
                }
                if (useStatement !== '') {
                    useStatements.push(useStatement);
                }
            }
        }
        return this.selector.insertUseStatements(useStatements);
    }
}