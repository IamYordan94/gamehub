import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Keyboard } from '@capacitor/keyboard';
import { App as CapacitorApp } from '@capacitor/app';
import HubLayout from './layouts/HubLayout';
import LetterMixLayout from './layouts/LetterMixLayout';
import WordPoolLayout from './layouts/WordPoolLayout';
import ChangeByOneLayout from './layouts/ChangeByOneLayout';
import Hub from './pages/Hub';
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
import ChangeByOneAbout from './pages/ChangeByOneAbout';
import ComingSoon from './pages/ComingSoon';

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    // Configure status bar
    StatusBar.setStyle({ style: Style.Dark }).catch(console.error);
    StatusBar.setBackgroundColor({ color: '#121218' }).catch(console.error);

    // Configure keyboard
    Keyboard.setAccessoryBarVisible({ isVisible: true }).catch(console.error);
    Keyboard.setScroll({ isDisabled: false }).catch(console.error);

    // Handle back button
    let cleanupListener: (() => void) | null = null;
    
    CapacitorApp.addListener('backButton', ({ canGoBack }: { canGoBack: boolean }) => {
      if (location.pathname === '/') {
        CapacitorApp.exitApp();
      } else if (canGoBack) {
        navigate(-1);
      } else {
        navigate('/');
      }
    }).then((listener) => {
      cleanupListener = () => listener.remove();
    });

    return () => {
      if (cleanupListener) {
        cleanupListener();
      }
    };
  }, [navigate, location]);

  return (
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
          <Route path="about" element={<ChangeByOneAbout />} />
        </Route>
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
