// https://eslint.org/docs/user-guide/configuring#configuring-rules
const OFF = 0
const WARN = 1
const ERROR = 2

module.exports = {
  extends: "eslint-config-react-app",
  rules: {
    "import/no-default-export": ERROR,
  },
}
