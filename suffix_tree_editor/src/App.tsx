// App.tsx
import React from "react";
import SVGComponent from "./components/SVGComponent";

const App: React.FC = () => {
  return (
    <div className="flex justify-center items-center w-full h-screen">
      <div className="w-4/5 h-4/5">
        <SVGComponent />
      </div>
    </div>
  );
};

export default App;
