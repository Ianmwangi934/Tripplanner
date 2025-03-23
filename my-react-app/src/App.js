import React from "react";
import TripForm from "./components/TripForm";
import './App.css';

function App() {
  return (
    <div className="App">
      <h1 className="text-3xl font-bold text-center mb-6">Trip Planner</h1>
      <TripForm />
    </div>
  );
}

export default App;
