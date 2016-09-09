/**
 * Takes a css file input, stripping out any identical selectors with identical declarations
 * TODO: prevent deduplication inside @media queries
 *
 * .pipe(sass())
 * .pipe(intercept(function(file) {
 *   return cssDeduplicator(file);
 * }))
 * @param   {File} file
 * @returns {File}
 */
module.exports = function cssDeduplicator(file) {
  var seen = {};
  var contents = file.contents.toString();
  contents = contents.replace(/\s*[^{}*/]+\{[^{}]*\}/g, function() {
    var cache_key = arguments[0].replace(/[\s\n]+/g, ' ').replace(/^\s+/, '');
    var output = arguments[0];
    if( seen[cache_key] ) {
      output = "";
    }
    seen[cache_key] = (seen[cache_key] || 0) + 1;
    return output;
  });

  file.contents = new Buffer(contents);
  return file;
}
