// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import { AutoUseContext } from './autoUseContext';
import { Core } from './core';
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(ctx: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
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

// this method is called when your extension is deactivated
export function deactivate() { }
