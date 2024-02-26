import React, { useEffect } from 'react';
import WebcamImage from "./pages/WebcamImage/container";
import './App.css';
import { startListening } from './store/states/testingCall';
import { useDispatch } from 'react-redux';


function App() {

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(startListening());
  }, [dispatch])

  return (
    <div className="App">
      <WebcamImage />
    </div>
    
  );
}

export default App;
