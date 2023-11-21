# The Paisley Compiler
> A grindy javascript precompiler created to provide zero-cost abstractions and added user convenience.

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

# Errors

Paisley values highly readable error messages.

This allow users to catch mistakes at compile-time instead of runtime in a manner that is easier to debug.

![Error Message Example 1](https://raw.githubusercontent.com/FluxFlu/paisley/main/showcase/error_message0.png)
![Error Message Example 2](https://raw.githubusercontent.com/FluxFlu/paisley/main/showcase/error_message1.png)
![Error Message Example 3](https://raw.githubusercontent.com/FluxFlu/paisley/main/showcase/error_message2.png)

# Documentation
Paisley's documentation is included with the compiler, and can be located using `paisley --docs`.

# Licensing

Paisley is licensed under the [GPL-3.0](https://github.com/FluxFlu/paisley/blob/main/LICENSE). A copy is included with the compiler, and can be located using `paisley --license`.