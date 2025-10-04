import React, { useState } from 'react';


import Material from './components/pages/FootNav/Material';  // Make sure the file name matches!

import Video from './components/pages/FootNav/AttandaceList';
import AttendanceList from './components/pages/FootNav/AttandaceList';
import AttendanceAnalysis from './components/pages/FootNav/AttendanceAnalysis';

const App = () => {


  return (
    <div className="app-wrapper">


      <Material />
      <AttendanceList/>
      <AttendanceAnalysis/>

    </div>

  );
};

export default App;
