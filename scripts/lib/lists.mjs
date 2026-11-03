// Edición de listas escritas en una línea (a, b) o en el formato de varias líneas que deja
// Prettier. Las comparten new-app.mjs y remove-examples.mjs.

/** ¿La lista (el texto entre corchetes o paréntesis) ya tiene este elemento? */
export function hasItem(body, item) {
  return body.split(/[,\n]/).some((entry) => entry.trim() === item);
}

/** Agrega elementos al final de la lista, en el mismo formato en que está escrita. */
export function appendItems(body, additions, separator = ", ") {
  if (!body.includes("\n")) {
    return body.trim() === ""
      ? additions.join(separator)
      : `${body}${separator}${additions.join(separator)}`;
  }
  const indent = body.match(/^\n?( +)/)?.[1] ?? "  ";
  const lines = additions.map((item) => `${indent}${item},\n`).join("");
  return `${body.replace(/\s*$/, "\n")}${lines}`;
}

/** Quita elementos de la lista, en el mismo formato en que está escrita. */
export function removeItems(body, items, separator = ", ") {
  if (!body.includes("\n")) {
    const splitter = separator.trim() === "" ? /\s+/ : separator.trim();
    return body
      .split(splitter)
      .map((entry) => entry.trim())
      .filter((entry) => entry !== "" && !items.includes(entry))
      .join(separator);
  }
  return body
    .split("\n")
    .filter((line) => !items.includes(line.trim().replace(/,$/, "")))
    .join("\n");
}
