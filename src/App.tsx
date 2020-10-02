import React from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import "./App.css";
import { Profile } from "./widgets";
import store, { persistor } from "./store/store";

function App() {
  return (
    <div className="App">
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <Profile />
        </PersistGate>
      </Provider>
    </div>
  );
}

export default App;
