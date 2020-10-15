import React from "react"
import { Provider } from "react-redux"
import { PersistGate } from "redux-persist/integration/react"
import "./App.css"
import { MyAppBar } from "app/widgets"
import store, { persistor } from "app/store/store"
import {
  SeApiServiceProvider,
  ThemeProvider,
  SnackbarProvider,
} from "app/providers"
import ReputationPage from "app/pages/ReputationPage"

function App() {
  return (
    <div className="App">
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <ThemeProvider>
            <SeApiServiceProvider>
              <SnackbarProvider>
                <MyAppBar />
                <ReputationPage />
              </SnackbarProvider>
            </SeApiServiceProvider>
          </ThemeProvider>
        </PersistGate>
      </Provider>
    </div>
  )
}

export default App
