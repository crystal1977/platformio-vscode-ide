/**
 * Copyright (c) 2017-present PlatformIO <contact@platformio.org>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as pioNodeHelpers from 'platformio-node-helpers';

import ProjectTaskManager from './project';
import { extension } from '../main';
import vscode from 'vscode';

export default class TaskManager {
  constructor() {
    this.subscriptions = [];
    this._ptm = undefined;

    this.subscriptions.push(
      vscode.commands.registerCommand('platformio-ide.refreshProjectTasks', () =>
        this.onDidProjectTasksRefresh()
      ),
      vscode.window.onDidChangeActiveTextEditor(() => this.checkActiveProjectDir()),
      vscode.workspace.onDidChangeWorkspaceFolders(() => this.checkActiveProjectDir())
    );
    // trigger project checking, register VSCode Task provider and View
    this.checkActiveProjectDir();
  }

  onDidProjectTasksRefresh() {
    if (this._ptm) {
      this._ptm.dispose();
      this._ptm = undefined;
    }
    this.checkActiveProjectDir();
  }

  checkActiveProjectDir() {
    const projectDir = extension.projectManager.getActivePIOProjectDir();
    if (this._ptm && this._ptm.projectDir === projectDir) {
      return;
    }
    if (this._ptm) {
      this._ptm.dispose();
      this._ptm = undefined;
    }
    if (!projectDir) {
      return;
    }
    this._ptm = new ProjectTaskManager(projectDir);
    this._ptm.requestRefresh();
  }

  dispose() {
    pioNodeHelpers.misc.disposeSubscriptions(this.subscriptions);
  }
}
