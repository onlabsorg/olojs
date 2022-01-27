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
 *  For example, the function `markdown('*bold*')` returns `<p><em>bold</em></p>`.
 */
module.exports = types => text => marked(text);
