# react-native-l20n

Experimental adaptation of Mozilla's [L20n](http://l20n.org/) localization
framework for use within [React Native](https://facebook.github.io/react-native/).

### Why L20n?

Mozilla has decades of experience shipping localized products. The design of
L20n reflects this accumulation of experience, and manages to deliver a format
as powerful as [ICU `MessageFormat`](http://userguide.icu-project.org/formatparse/messages),
but as simple as [`gettext`](https://en.wikipedia.org/wiki/Gettext).

If these comparisons mean nothing to you, perhaps it will suffice to say that
L20n makes it easy to isolate the strings in your application, perform basic
variable substitutions, and handle language nuances like pluralization, gender,
and declension.

You don't take my word for it, though. Here are three excellent resources for
getting started with L20n:

* Learn the syntax with this quick step-by-step [guide](http://l20n.org/learn/).

* Tinker with framework with this [in-browser IDE](http://l20n.github.io/tinker/).

* Read about the decisions that underpin the powerful, asymmetric design of the
  framework in this [blog post](http://informationisart.com/21/).

### What's different for React Native?

The main drawback of L20n, at present, is that it's designed for the web and
takes a heavy dependency upon the DOM as its interface. Just as `StyleSheet`
brought the best of CSS for use in React Native, this module decouples L20n
from the DOM and makes it available to your React Native app through a
familiar, idiomatic interface.

The first similarity to `StyleSheet` is that L20n translations are meant to be
declared within the component they're used, alongside styles. For example:

```javascript
const styles = StyleSheet.create({...});
const l20n = L20n.create({...});
```

As a consequence, nothing in the React Native implementation of L20n is
asynchronous, which means that the interface for accessing translations is
a simple, synchronous function that returns a string, like such:

```javascript
render() {
  return (
    <Text style={styles.text}>
      {l20n.helloWorld()}
    </Text>
  );
}
```

As seen in this example, the React Native implementation of L20n does not
utilize `data` attributes (or any annotations in the virtual DOM or JSX) to
look up translations; it's just simple function calls, which means it can be
used with any component, builtin or third party.

My advice is to generally ignore the API documentation on Mozilla's L20n
website with the exception of their [guide to FTL](http://l20n.org/learn/), the
L20n translation format.

Finally, it's worth noting that L20n depends upon the ECMAScript
Internationalization API (found in browsers under `window.Intl`), which this
module provides via polyfill. FTL's [built-in functions](https://github.com/l20n/l20n.js/blob/97d9e50d5ec7ae84fed0db8a910c21f78880a5f1/src/intl/builtins.js)
(including `NUMBER`, `PLURAL`, and `DATETIME`) are delegated to the
corresponding Internationalization API with their arguments intact. This module
also removes bidirectional isolation characters which are inserted by L20n, but
not supported by either React Native platform.

## Example

```bash
npm install --save react-native-l20n
```

```javascript
import React, {Component} from 'react';
import {View, Text} from 'react-native';
import L20n, {ftl} from 'react-native-l20n';

const l20n = L20n.create({
  en: ftl`
    product = react-native-l20n
    welcome = Welcome, {$name}, to {product}!
    description =
      | {product} makes it possible to harness the forward-thinking
      | design of Mozilla's L20n in an idiomatic fashion.
  `,

  es: ftl`
    welcome = Bienvenidos, {$name}, a {product}!
  `,
});

class Example extends Component {
  render() {
    return (
      <View>
        <Text style={{fontWeight: 'bold'}}>
          {l20n.welcome({name: 'James'})}
        </Text>
        <Text>
          {l20n.description()}
        </Text>
      </View>
    );
  }
}
```

## API

### `L20n.create(translations)`

`translations` is an object that maps locales to translations.  
Locales are specified as two-letter [ISO 639-1 codes](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes).  
Translations are specified in L20n's [FTL format](http://l20n.org/learn/).

`L20n.create()` returns an object that maps each translation key to a function.
The function can be invoked with a single object argument to provide variables
for substitution into the translated string.

When the function is invoked, a translation for the current locale is used; if
none is available, the default locales are attempted in order. Failing that,
the translation key is returned.

*Example:*

```javascript
import L20n from 'react-native-l20n';

const l20n = L20n.create({
  en: `key = The value is: {$variable}`
  es: `key = El valor es: {$variable}`
});

console.log(l20n.key({variable: 'foo'));
// => "The value is: foo" if device is in English
// => "El valor es: foo" if device is in Spanish
```

### `L20.currentLocale`

Get or set the current locale.  
The locale is specified as a two-letter [ISO 639-1 code](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes).

The value is initialized to the locale of the device. If you wish to
programmatically change it, do so before rendering your first component.

### `L20.defaultLocales`

Get or set the default locales.  
Locales are specified as two-letter [ISO 639-1 codes](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes).  
These locales are attempted when a translation isn't available for the current
locale.

Defaults to `['en']`. If you wish to programmatically change it, do so before
rendering your first component.

### `ftl`

ES6 templated string tag for [FTL](http://l20n.org/learn/), the L20n
translation format.

The `ftl` tag is not required, but enables you to indent your translations,
which is not normally legal. It also removes newlines from piped, multi-line
translations, which better emulates the whitespace-collapsing nature of HTML.

*Example:*

```javascript
import {ftl} from 'react-native-l20n';

const translations = {
  en: ftl`
    firstKey = First
    secondKey =
      | This string spans
      |                   multiple lines.
  `,
};

console.log(translations.en);
// (The output is legal FTL.) =>
// firstKey = First
// secondKey =
// | This string spans multiple lines.
```

## Future work

One of the creators of L20n, [@stasm](https://github.com/stasm), has been
exploring proposals for deeper integration of L20n into browser-based React.
A very thorough series of proposals is under discussion on [this thread](https://groups.google.com/d/msg/mozilla.tools.l10n/XtxHgBEokCA/onHthNvtBgAJ).

The approach of this module is to hew as closely as possible to plain-old
portable JavaScript, with some conveniences added to conform with React Native
idioms. Perhaps L20n will formalize an API that requires neither DOM access or
Node.js builtin modules, which would eliminate the need to vendor a modified
version of the L20n framework. (This would likely involve isolating the FTL
parser and runtime from the rest of L20n.)

Beyond that, there are a number of enhancements that could be added to this
module to mature it into a scalable localization solution:

* Handle the [`TODOs`](/index.js) listed at the top of the source.

* Generalize this module for use in browser-based React, or completely apart
  from any framework. This would essentially substitute for the L20n [Node.js interface](https://github.com/l20n/l20n.js/blob/97d9e50d5ec7ae84fed0db8a910c21f78880a5f1/docs/node.md),
  which is a bit lacking.

* Build tooling to collect strings from components, and support
  loading/bundling of translation into separate files, apart from the component
  definitions.

* Build a runtime inspector to identify translation keys.

More than anything, I'd appreciate your feedback on what it will take for this
module to become a production-grade solution for your needs. Please open an
[issue](https://github.com/jamesreggio/react-native-l20n/issues) to discuss.
