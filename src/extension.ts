import * as vscode from 'vscode';

import { AutoUseContext } from './autoUseContext';
import { Core } from './core';

export function activate(ctx: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "auto-use" is now active!');

	const editor = vscode.window.activeTextEditor;

	if (editor === undefined) { return; }

	const context: AutoUseContext = {
		extensionContext: ctx,
		editor: editor
	};

	const core = new Core(context);

	core.attatchCommands();
}

export function deactivate() { }
