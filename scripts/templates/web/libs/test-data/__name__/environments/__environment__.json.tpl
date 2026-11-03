{
  "baseUrl": "[[url]]",
  "users": {
    "standard": {
      "username": "${[[ENV_PREFIX]]_STANDARD_USER}",
      "password": "${[[ENV_PREFIX]]_STANDARD_PASSWORD}"
    },
    "invalid": {
      "username": "${[[ENV_PREFIX]]_STANDARD_USER}",
      "password": "wrong_password"
    }
  }
}
