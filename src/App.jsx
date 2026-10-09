import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import ScrollToTop from './components/ScrollToTop';
import { AdminProvider } from '@/lib/AdminContext';
import Layout from '@/components/Layout';
import Home from '@/pages/Home';
import HistoricalConcepts from '@/pages/HistoricalConcepts';
import Paper1 from '@/pages/Paper1';
import Paper2 from '@/pages/Paper2';
import Paper3 from '@/pages/Paper3';
import IA from '@/pages/IA';
import EE from '@/pages/EE';
import { TrackProvider } from '@/lib/TrackContext';
import IgcseTopic from '@/pages/igcse/IgcseTopic';

const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/historical-concepts" element={<HistoricalConcepts />} />
        <Route path="/paper-1" element={<Paper1 />} />
        <Route path="/paper-2" element={<Paper2 />} />
        <Route path="/paper-3" element={<Paper3 />} />
        <Route path="/ia" element={<IA />} />
        <Route path="/ee" element={<EE />} />
        <Route path="/igcse/:topic" element={<IgcseTopic />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
      <QueryClientProvider client={queryClientInstance}>
        <Router basename={import.meta.env.BASE_URL.replace(/\/$/, '') || undefined}>
          <ScrollToTop />
          <AdminProvider>
            <TrackProvider>
              <AppRoutes />
            </TrackProvider>
          </AdminProvider>
        </Router>
        <Toaster />
      </QueryClientProvider>
  )
}

export default App