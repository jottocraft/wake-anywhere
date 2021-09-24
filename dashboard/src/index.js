import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { BrowserRouter } from "react-router-dom";
import Root from "shamrock-ux/react/Root";

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <Root>
        <App />
      </Root>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
);