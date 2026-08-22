import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import HubLayout from './layouts/HubLayout';
import Hub from './pages/Hub';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import ComingSoon from './pages/ComingSoon';
import NotFound from './pages/NotFound';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSkeleton from './components/LoadingSkeleton';

// Lazy-loaded game pages for code splitting
const LetterMixHome = lazy(() => import('./pages/LetterMixHome'));
const LetterMixLayout = lazy(() => import('./layouts/LetterMixLayout'));
const LetterMixPage = lazy(() => import('./pages/LetterMixPage'));
const LetterMixCalendar = lazy(() => import('./pages/LetterMixCalendar'));
const LetterMixAbout = lazy(() => import('./pages/LetterMixAbout'));

const WordPoolHome = lazy(() => import('./pages/WordPoolHome'));
const WordPoolLayout = lazy(() => import('./layouts/WordPoolLayout'));
const WordPoolPage = lazy(() => import('./pages/WordPoolPage'));
const WordPoolPreviousGames = lazy(() => import('./pages/WordPoolPreviousGames'));
const WordPoolSettings = lazy(() => import('./pages/WordPoolSettings'));
const WordPoolAbout = lazy(() => import('./pages/WordPoolAbout'));

const ChangeByOneHome = lazy(() => import('./pages/ChangeByOneHome'));
const ChangeByOneLayout = lazy(() => import('./layouts/ChangeByOneLayout'));
const ChangeByOnePage = lazy(() => import('./pages/ChangeByOnePage'));
const ChangeByOneCalendar = lazy(() => import('./pages/ChangeByOneCalendar'));
const ChangeByOneAbout = lazy(() => import('./pages/ChangeByOneAbout'));

const OrderleHome = lazy(() => import('./pages/OrderleHome'));
const OrderleLayout = lazy(() => import('./layouts/OrderleLayout'));
const OrderlePage = lazy(() => import('./pages/OrderlePage'));
const OrderleCalendar = lazy(() => import('./pages/OrderleCalendar'));
const OrderleAbout = lazy(() => import('./pages/OrderleAbout'));

const FermiHome = lazy(() => import('./pages/FermiHome'));
const FermiLayout = lazy(() => import('./layouts/FermiLayout'));
const FermiPage = lazy(() => import('./pages/FermiPage'));
const FermiCalendar = lazy(() => import('./pages/FermiCalendar'));
const FermiAbout = lazy(() => import('./pages/FermiAbout'));

const QuizHome = lazy(() => import('./pages/QuizHome'));
const QuizLayout = lazy(() => import('./layouts/QuizLayout'));
const QuizPage = lazy(() => import('./pages/QuizPage'));
const QuizAbout = lazy(() => import('./pages/QuizAbout'));

function App() {
  return (
    <ErrorBoundary>
    <BrowserRouter>
      <Analytics />
      <Suspense fallback={<LoadingSkeleton />}>
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
        <Route path="/orderle">
          <Route index element={<OrderleHome />} />
          <Route element={<OrderleLayout />}>
            <Route path="play" element={<OrderlePage />} />
            <Route path="calendar" element={<OrderleCalendar />} />
            <Route path="about" element={<OrderleAbout />} />
          </Route>
        </Route>
        <Route path="/fermi">
          <Route index element={<FermiHome />} />
          <Route element={<FermiLayout />}>
            <Route path="play" element={<FermiPage />} />
            <Route path="calendar" element={<FermiCalendar />} />
            <Route path="about" element={<FermiAbout />} />
          </Route>
        </Route>
        <Route path="/quiz">
          <Route index element={<QuizHome />} />
          <Route element={<QuizLayout />}>
            <Route path="play" element={<QuizPage />} />
            <Route path="about" element={<QuizAbout />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
      </Suspense>
    </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
