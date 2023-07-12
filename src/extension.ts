import * as vscode from "vscode";

export const activate = (context: vscode.ExtensionContext): void => {
  const disposable = vscode.commands.registerCommand("extension.sortImports", () => {
    updateImports(false);
  });

  vscode.workspace.onWillSaveTextDocument(() => {
    updateImports(false);
  });

  context.subscriptions.push(disposable);
};

const updateImports = (ascending: boolean): void => {
  const editor = vscode.window.activeTextEditor;
  if (editor) {
    const document = editor.document;
    const text = document.getText();

    const lines = text.split("\n");
    const imports = [];
    const nonImports = [];

    const importStartKeywords: { [key: string]: string[] } = {
      javascript: ["import", "export", "require", "module.exports", "export default"],
      typescript: ["import", "export", "require", "module.exports", "export default"],
      python: ["import"],
      java: ["import", "package"],
      csharp: ["using"],
      cpp: ["#include"],
      ruby: ["require"],
      php: ["require", "include", "namespace", "use"],
      swift: ["import"],
      go: ["import"],
      kotlin: ["import"],
      rust: ["use", "extern crate"],
      scala: ["import"],
      groovy: ["import"],
      perl: ["use"],
      lua: ["require"],
      r: ["library"],
      matlab: ["import"],
      haskell: ["import"],
      shell: ["source", "."]
    };

    for (const line of lines) {
      const languageId = document.languageId.toLowerCase();

      if (!languageId) {
        continue;
      }

      const startKeywords = importStartKeywords[languageId];

      if (startKeywords && Array.isArray(startKeywords) && startKeywords.some((keyword: string) => line.trim().startsWith(keyword))) {
        imports.push(line);
      } else {
        nonImports.push(line);
      }
    }

    if (ascending) {
      imports.sort((a, b) => a.length - b.length);
    } else {
      imports.sort((a, b) => b.length - a.length);
    }

    const updatedText = [...imports, ...nonImports].join("\n");

    void editor.edit(editBuilder => {
      const firstLine = document.lineAt(0);
      const lastLine = document.lineAt(document.lineCount - 1);
      const textRange = new vscode.Range(firstLine.range.start, lastLine.range.end);
      editBuilder.replace(textRange, updatedText);
    });
  }
};

export default {
  activate
};