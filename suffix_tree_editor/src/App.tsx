// App.tsx
import React from "react";
import SVGComponent from "./components/SVGComponent";
import { ReactNotifications } from "react-notifications-component";

const App: React.FC = () => {
  return (
    <div className="flex flex-col h-screen items-center pb-10">
      <ReactNotifications></ReactNotifications>
      <header className="flex justify-center text-bold text-5xl py-8">
        <h1>Suffix Tree Editor</h1>
      </header>
      <div className="flex-1 overflow-hidden w-4/5">
        <SVGComponent />
      </div>
    </div>
  );
};

export default App;
