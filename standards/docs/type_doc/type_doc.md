# Description

- [`TypeDoc`](https://typedoc.org/) converts comments in `TypeScript` source code into rendered `HTML` documentation or a `JSON` model
- It will produce documentation even if the source code doesn't have any comments
- [Code comments](https://typedoc.org/guides/doccomments/#doc-comments) will of course enhance the quality of the documentation
- [Example](https://typedoc.org/example/)

# Usage

Comment only pieces of code that are not self-explanatory.

# Installation

```bash
> yarn add -D typedoc
```

# Configuration

Place a a file called `typedoc.json` in the project's root directory with the following contents:

```json
{
  // where to look for source files to build documentation from
  "entryPoints": ["./src/**/*.ts"],
  // where to place documentation
  "out": "./type_doc"
}
```

# Run

Add the following script in the project's `package.json`:

```json
"scripts": {
  ...,
  "doc": "typedoc",
  ...
}
```

Run the script:

```bash
> yarn doc
```

# Explore Docs

Navigate to `<root>/type_doc` and open the files `index.html` and `hierarchy.html` on a browser to explore the output from `TypeDoc`.
