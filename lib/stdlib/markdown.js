/**
 *  markdown - olojs expression stdlib module
 *  ============================================================================
 *  This module contains functions to render the `markdown` markup format.
 */

const marked = require("marked");

/**
 *  markdown - function
 *  ----------------------------------------------------------------------------
 *  Takes a markdown text as input and returns the corresponding HTML text.
 *  ```
 *  html_text = markdown(md_text)
 *  ```
 */
exports.__apply__ = text => marked(text);
