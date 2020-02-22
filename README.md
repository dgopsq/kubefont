# Kubefont

![Example image](https://raw.githubusercontent.com/dgopsq/kubefont/master/helloworld.gif?token=ABNP7I4Z6QTKE32YY7HRXQ26LJ4NG)

A highly-customizable **React** component (written in **Typescript**) using **Three.js** to show a text and a number of random-positioned cubes. It exploits the normal hover event to move the camera while on desktop, and the gyroscope on mobile devices.

This is an experiment I made to test the integration between **React** and **Three.js**. It is not remotely tested enough or fit for a production environment.

## Usage

Install the component using your favourite package manager:

```bash
# npm
npm install kubefont

# yarn
yarn add kubefont
```

Then use it as simple as:

```js
import React from 'react';
import Kubefont from 'kubefont';

const App = () => (
  <div style={{ width: '100vw', height: '100vh' }}>
    <Kubefont text="Hello World" textFontUrl="/font.json" />
  </div>
);
```

The `textFont` prop takes the path to your **JSON font**. This font must be served as a static file from your app. To create a JSON font you can use [Facetype.js](https://gero3.github.io/facetype.js/).

This component **takes the same size of its parent container**.

## API

These are the props accepted by the **Kubefont** component:

| Prop name                     | Type     | Description                                                             | Required | Default     |
| ----------------------------- | -------- | ----------------------------------------------------------------------- | -------- | ----------- |
| **text**                      | String   | The string to display                                                   | Yes      | -           |
| **textFontUrl**               | String   | The path to the JSON font file (served statically from the webserver)   | Yes      | -           |
| **textColor**                 | String   | The text color in HEX                                                   | No       | `"#dddddd"` |
| **cameraDistance**            | Number   | The text distance from the camera                                       | No       | `400`       |
| **cubesColor**                | String   | The cubes color in HEX                                                  | No       | `"#dddddd"` |
| **particlesNumber**           | Number   | The number of cubes to display                                          | No       | `50`        |
| **scattering**                | Number   | The cubes' scattering level                                             | No       | `1.5`       |
| **backgroundColor**           | String   | The environment background color                                        | No       | `'#000000'` |
| **useGyroscope**              | Boolean  | Whether to use the gyroscope or the hover event                         | No       | `false`     |
| **GyroscopeRequestComponent** | Function | Takes a function as a parameter and return a new React node (see below) | No       | -           |

## Gyroscope

This component supports the `DeviceOrientationEvent` ([W3C Documentation](https://www.w3.org/TR/orientation-event/)). In **iOS13** you have to ask for permission to use the gyroscope and this permission must be granted "manually" (E.g. from a `onClick` event) from the user. To handle this particular case this component supports the `GyroscopeRequestComponent` prop, which takes a function as the only parameter and return a new React node. This new React node will be added over the Three.js canvas (you can even position it `absolute`) and triggering the passed function from there will try to obtain the permission to use the gyroscope.

**To use the gyroscope you HAVE to set this props.\***

```js
import React from 'react';
import Kubefont from 'kubefont';

const App = () => (
  <div style={{ width: '100vw', height: '100vh' }}>
    <Kubefont
      text="Hello World"
      textFontUrl="/font.json"
      useGyroscope={true}
      GyroscopeRequestComponent={request => (
        <a onClick={request}>Enable Gyroscope</a>
      )}
    />
  </div>
);
```
