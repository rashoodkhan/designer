/**
 * @license
 * Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

define('polymer-designer/commands/DomCommandApplier', [
      'polymer-designer/commands/CommandApplier',
      'polymer-designer/dom-utils',
      'polymer-designer/path',
      'polymer-designer/commands'],
    function(CommandApplier, domUtils, pathLib, commands) {

  var getNodeFromPath = function(path, doc) {
    return pathLib.getNodeFromPath(path, doc, domUtils.designerNodeFilter);
  }

  var commandHandlers = {
    'setAttribute': {
      canApply: function(doc, command) {
        var node = getNodeFromPath(command.path, doc);
        return node.getAttribute(command.attribute) === command.oldValue;
      },

      apply: function(doc, command) {
        var node = getNodeFromPath(command.path, doc);
        node.setAttribute(command.attribute, command.newValue);
      },

      canUndo: function(doc, command) {
        var node = getNodeFromPath(command.path, doc);
        return node.getAttribute(command.attribute) === command.newValue;
      },

      undo: function(doc, command) {
        var node = getNodeFromPath(command.path, doc);
        node.setAttribute(command.attribute, command.oldValue);
      },
    },

    'setTextContent': {
      canApply: function(doc, command) {
        var node = getNodeFromPath(command.path, doc);
        if (!node) return false;
        var hasElementChildren = node.children === 0;
        if (hasElementChildren) {
          console.warn(
              'Not applying', command,
              'because target node', node, 'has element children');
        }
        return !hasElementChildren;
      },

      apply: function(doc, command) {
        var node = getNodeFromPath(command.path, doc);
        node.textContent = command.newValue;
      },

      canUndo: function(doc, command) {
        var node = getNodeFromPath(command.path, doc);
        return node.textContent === command.newValue;
      },

      undo: function(doc, command) {
        var node = getNodeFromPath(command.path, doc);
        node.textContent = command.oldValue;
      },
    },

    'moveElement': {
      canApply: function(doc, command) {
        var el = pathLib.getNodeFromPath(command.path, doc);
        var target = pathLib.getNodeFromPath(command.targetPath, doc);
        return el != null && target != null &&
            (command.position == commands.InsertPosition.before ||
             command.position == commands.InsertPosition.after);
      },

      apply: function(doc, command) {
        var el = pathLib.getNodeFromPath(command.path, doc);
        var target = pathLib.getNodeFromPath(command.targetPath, doc);
        var container = target.parentNode;
        if (command.position == commands.InsertPosition.before) {
          container.insertBefore(el, target);
        } else if (command.position == commands.InsertPosition.after) {
          target = target.nextSibling;
          container.insertBefore(el, target);
        }
      },

      canUndo: function(doc, command) {
        return false;
      },
    },
  };

  /**
   * Applies commands to DOM Documents, including embedded and linked
   * stylesheets.
   */
  function DomCommandApplier(doc) {
    CommandApplier.call(this, doc);
    this.handlers = commandHandlers;
  }
  DomCommandApplier.prototype = Object.create(CommandApplier.prototype);
  DomCommandApplier.prototype.constructor = DomCommandApplier;

  // exports
  return DomCommandApplier;
});
