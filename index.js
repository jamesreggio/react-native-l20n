// L20n depends upon the ECMAScript Internationalization API,
// which we polyfill with this module built for Node.js.
import 'intl';

// We have to vendor a copy of L20n for now, because its Node.js build
// takes an unnecessary dependency upon `fs`, which we manually remove.
import './lib/l20n';

// There are many opportunities for improvement!
// TODO: Get native locale.
// TODO: Detect changes in native locale.
// TODO: Support LCIDs (e.g., en-US) in addition to ISO 639-1 codes.
// TODO: Support hot reloading.
// TODO: Support composition of L20n instances.
// TODO: Consider using identifiers (a la StyleSheet) to reduce bridge traffic.

// Unicode bidi isolation characters.
const BIDI = ['\u2068', '\u2069'];

// Remove Unicode bidi isolation characters from the specified string.
// L20n inserts these characters at the site of every substituted value, but
// they are not supported by React Native and generally cause problems, like
// making an empty string appear to have a length of 2.
function clean(string) {
  return BIDI.reduce((string, character) => {
    return string.replace(new RegExp(character, 'g'), '');
  }, string);
}

const L20n = {
  currentLocale: null,
  defaultLocales: ['en'],

  // Create an object of L20n translations.
  // Translations are specified by an object with {locale: ftl} pairs.
  create(translations) {
    const contexts = {};
    const instance = {};

    // Find the active context and return a formatted string for the key.
    function format(key, props) {
      const locales = [L20n.currentLocale].concat(L20n.defaultLocales);
      const locale = locales.find((locale) => {
        return contexts[locale] && contexts[locale].messages.has(key);
      });

      const context = contexts[locale];
      const message = context.messages.get(key);
      const [value, errors] = context.format(message, props);
      errors.forEach((error) => console.warn(error));
      return clean(value);
    }

    // Build a context for each locale, and build the instance object with
    // format functions bound to each unique key.
    Object.keys(translations).forEach((locale) => {
      const context = new Intl.MessageContext(locale);
      const errors = context.addMessages(translations[locale]);
      errors.forEach((error) => console.warn(error));
      for ([key] of context.messages) {
        instance[key] = instance[key] || format.bind(null, key);
      }
      contexts[locale] = context;
    });

    return instance;
  },
};

export default L20n;

// ES6 templated string tag for FTL, the L20n translation format.
// Removes leading whitespace, allowing FTL to be written at any indentation.
// Also removes explicit newlines from piped, multi-line translations.
export function ftl(strings, ...values) {
  return strings
    .map((string, i) => string + (i < values.length ? values[i] : ''))
    .join('')
    .replace(/^\s*/mg, '')
    .replace(/\s*\n\|\s*/mg, ' ');
};
