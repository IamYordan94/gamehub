import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import HubLayout from './layouts/HubLayout';
import LetterMixLayout from './layouts/LetterMixLayout';
import WordPoolLayout from './layouts/WordPoolLayout';
import ChangeByOneLayout from './layouts/ChangeByOneLayout';
import Hub from './pages/Hub';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import LetterMixHome from './pages/LetterMixHome';
import LetterMixPage from './pages/LetterMixPage';
import LetterMixCalendar from './pages/LetterMixCalendar';
import LetterMixAbout from './pages/LetterMixAbout';
import WordPoolHome from './pages/WordPoolHome';
import WordPoolPage from './pages/WordPoolPage';
import WordPoolPreviousGames from './pages/WordPoolPreviousGames';
import WordPoolSettings from './pages/WordPoolSettings';
import WordPoolAbout from './pages/WordPoolAbout';
import ChangeByOneHome from './pages/ChangeByOneHome';
import ChangeByOnePage from './pages/ChangeByOnePage';
import ChangeByOneCalendar from './pages/ChangeByOneCalendar';
import ChangeByOneAbout from './pages/ChangeByOneAbout';
import ComingSoon from './pages/ComingSoon';
import NotFound from './pages/NotFound';

function App() {
  return (
    <BrowserRouter>
      <Analytics />
      <Routes>
        <Route path="/" element={<HubLayout />}>
          <Route index element={<Hub />} />
          <Route path="coming-soon" element={<ComingSoon />} />
          <Route path="privacy" element={<Privacy />} />
          <Route path="terms" element={<Terms />} />
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
        <Route path="/wordpool">
          <Route index element={<WordPoolHome />} />
          <Route element={<WordPoolLayout />}>
            <Route path="play" element={<WordPoolPage />} />
            <Route path="previous" element={<WordPoolPreviousGames />} />
            <Route path="settings" element={<WordPoolSettings />} />
            <Route path="about" element={<WordPoolAbout />} />
            <Route path="category/:categoryId" element={<WordPoolPage />} />
            <Route path=":date" element={<WordPoolPage />} />
          </Route>
        </Route>
        <Route path="/changebyone">
          <Route index element={<ChangeByOneHome />} />
          <Route element={<ChangeByOneLayout />}>
            <Route path="play" element={<ChangeByOnePage />} />
            <Route path="play/:date" element={<ChangeByOnePage />} />
            <Route path="calendar" element={<ChangeByOneCalendar />} />
            <Route path="about" element={<ChangeByOneAbout />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
