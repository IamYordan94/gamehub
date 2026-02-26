import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HubLayout from './layouts/HubLayout';
import LetterMixLayout from './layouts/LetterMixLayout';
import WordPoolLayout from './layouts/WordPoolLayout';
import ChangeByOneLayout from './layouts/ChangeByOneLayout';
import Hub from './pages/Hub';
import LetterMixHome from './pages/LetterMixHome';
import LetterMixPage from './pages/LetterMixPage';
import LetterMixCalendar from './pages/LetterMixCalendar';
import LetterMixAbout from './pages/LetterMixAbout';
import WordPoolPage from './pages/WordPoolPage';
import WordPoolPreviousGames from './pages/WordPoolPreviousGames';
import WordPoolSettings from './pages/WordPoolSettings';
import WordPoolAbout from './pages/WordPoolAbout';
import ChangeByOnePage from './pages/ChangeByOnePage';
import ChangeByOneAbout from './pages/ChangeByOneAbout';
import ComingSoon from './pages/ComingSoon';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HubLayout />}>
          <Route index element={<Hub />} />
          <Route path="coming-soon" element={<ComingSoon />} />
        </Route>
        <Route path="/lettermix">
          <Route index element={<LetterMixHome />} />
          <Route element={<LetterMixLayout />}>
            <Route path="play" element={<LetterMixPage />} />
            <Route path="play/:date/:level" element={<LetterMixPage />} />
            <Route path="play/:level" element={<LetterMixPage />} />
            <Route path="calendar" element={<LetterMixCalendar />} />
            <Route path="about" element={<LetterMixAbout />} />
          </Route>
        </Route>
        <Route path="/wordpool" element={<WordPoolLayout />}>
          <Route index element={<WordPoolPage />} />
          <Route path="previous" element={<WordPoolPreviousGames />} />
          <Route path="settings" element={<WordPoolSettings />} />
          <Route path="about" element={<WordPoolAbout />} />
          <Route path="category/:categoryId" element={<WordPoolPage />} />
          <Route path=":date" element={<WordPoolPage />} />
        </Route>
        <Route path="/changebyone" element={<ChangeByOneLayout />}>
          <Route index element={<ChangeByOnePage />} />
          <Route path="about" element={<ChangeByOneAbout />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
