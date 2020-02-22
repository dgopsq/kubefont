import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Kubefont from '../.';

const App = () => {
  return <Kubefont text="HELLO WORLD" textFontUrl="/font.json" />;
};

ReactDOM.render(<App />, document.getElementById('root'));
