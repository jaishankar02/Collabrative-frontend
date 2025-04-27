import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import HomePage from './components/HomePage';
import EditorPage from './components/EditorPage';


function App() {
  return (
    <BrowserRouter>
    <Routes>
      <Route path='/' element={<HomePage/>}></Route>
      <Route path='/editor/:roomId' element={<EditorPage/>}></Route>
    </Routes>
    </BrowserRouter>
  );
}

export default App;
