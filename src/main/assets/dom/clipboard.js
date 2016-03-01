define([], function () {
  "use strict";

  /**
   * clipboard module
   */
  var clipboard;
  (function (clipboard) {
    var doc = document;

    /**
     * Copy Node content into clipboard
     *
     * @param {Node} node
     */
    function copyNode(node) {
      var bodyElement = _getElementBody();
      // Set inline style to override css styles
      bodyElement.style.webkitUserSelect = 'initial';

      var selection = doc.getSelection();
      selection.removeAllRanges();
      node.select();

      if (!doc.execCommand('copy')) {
        throw new Error('failure copy');
      }
      selection.removeAllRanges();

      // Reset inline style
      bodyElement.style.webkitUserSelect = '';
    }

    clipboard.copyNode = copyNode;

    /**
     * Copy text into clipboard
     *
     * @param {string} text
     */
    function copyText(text) {
      var bodyElement = _getElementBody();
      var node = _createNode(text);
      bodyElement.appendChild(node);
      copyNode(node);
      bodyElement.removeChild(node);
    }

    clipboard.copyText = copyText;

    function _createNode(text) {
      var node = doc.createElement('textarea');
      node.style.position = 'absolute';
      node.style.left = '-10000px';
      node.textContent = text;
      return node;
    }

    function _getElementBody() {
      return doc.body || doc.getElementsByTagName("body")[0];
    }

  }(clipboard || (clipboard = {})));

  return clipboard;
});