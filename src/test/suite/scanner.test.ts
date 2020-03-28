import * as assert from 'assert';
import * as vscode from 'vscode';

import { DB } from '../../db';

import { MockAutoUseContext } from '../src/mockAutoUseContext';
import { Scanner } from '../../scanner';
import { join } from 'path';


suite('Extension Test Suite', () => {
    setup(() => {
        DB.deleteAll();
    });

    test('rootPath', () => {
        assert.strictEqual(vscode.workspace.workspaceFolders!.length, 1);
        assert.strictEqual(vscode.workspace.rootPath!, join(__dirname, '../../../src/test/testWorkSpace'));
    });

    test('scan', async () => {
        const scanner = new Scanner(MockAutoUseContext);
        await scanner.scan();
        assert.strictEqual(DB.all().length, 6, 'get six');
    });
});
