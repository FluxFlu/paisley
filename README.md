# The Paisley Precompiler
> A grindy javascript precompiler created to provide zero-cost abstractions and user convenience.

![Endpoint Badge](https://img.shields.io/npm/dt/paisley)
![Static Badge](https://img.shields.io/badge/License-GPL--3.0-blue)

# Installation
Install Paisley like you would any other node module.

```sh
$ npm i paisley -g
```

# Usage
Paisley is run with the syntax `paisley [file.sly] options`.

```sh
$ paisley example.sly --throw-for-errors true
```

# Syntax

Paisley uses a clean, c-style syntax for writing javascript. Here is a simple example:
```js
#define constant [300]
#macro add[x, y] [x + y]

console.log(add(constant, 200)); // Logs "500"
```

# Documentation
Paisley's documentation is included with the compiler, and can be located using `paisley --docs`.

# Licensing

Paisley is licensed under the [GPL-3.0](https://github.com/FluxFlu/paisley/blob/main/LICENSE-GPL). A copy is included with the compiler, and can be located using `paisley --license`.