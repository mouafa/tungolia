module.exports = {
  root: true,
  // https://github.com/feross/standard/blob/master/RULES.md#javascript-standard-style
  extends: 'standard',
  // add your custom rules here
  'rules': {
    // allow paren-less arrow functions
    'arrow-parens': 0,
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
    // desable === and !==
    'eqeqeq': 0,
    'no-useless-escape': 0,
    'camelcase': 0,
    'space-before-function-paren' : 0

  },
  'globals': {
        // 'Boom': false
    }
}
