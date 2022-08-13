
# Blueprint-Framework

  

A simple framework for building interactive Unreal Engine like blueprint editors in the browser.

  

## Features

  

- Serliaztion and deserialization

- Clean and easy to use API

- 100% Customizable and extensible

  

## Installation

  

```

npm install blueprint-framework

```

  

### Or

  

```sh

# Clone the repository

git clone https://github.com/webtacular/Blueprint-Framework.git

  

# Navigate to the directory

cd Blueprint-Framework

  

# Install the dependencies

npm install

  

# Build the project

npm run build

```

  

## Examples

  

You can find a set of examples [here](https://github.com/webtacular/Blueprint-Framework/exampels/), if you spot an issue or just need help dont hesitate to [contribute](https://github.com/webtacular/Blueprint-Framework/issues/new) or open a [support ticket](https://github.com/webtacular/Blueprint-Framework/issues/new), I would be more than happy to help you!

  

- [Konva](https://github.com/webtacular/Blueprint-Framework/tree/main/examples/konva) - A simple example of a simple blueprint implementation using the Konva framework.

  
  

## Usage

Import dependencies.

```js
import manager, { GUID } from 'blueprint-framework';
// OR //
const manager = require('blueprint-framework');
```
  
 Set up the manager, The manager is responsible for verifying, maintaining, modifying, serializing nodes.  
 ### Manager - [Parameters](https://github.com/webtacular/Blueprint-Framework/blob/1669bdeedaa2ac95a2d53aa1db07a1a22f04307b/src/types.d.ts#L225)
-  [mousePositionHook](https://github.com/webtacular/Blueprint-Framework/blob/1669bdeedaa2ac95a2d53aa1db07a1a22f04307b/src/types.d.ts#L19) - A Function that returns the current Position of the mouse.
```js
const man = new manager({
	// -- All the manager needs to function is a have a 
	// 	  Function passed into it that returns the current
	// 	  Position of the mouse. { x: number, y: number }
	mousePositionHook: () => layer.getRelativePointerPosition()
});
```

