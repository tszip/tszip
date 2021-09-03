import 'react-app-polyfill/ie11';

// @ts-ignore
import * as ReactDOM from 'react-dom';
import { Thing } from '../src';

const App = () => {
  return (
    <div>
      <Thing />
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
