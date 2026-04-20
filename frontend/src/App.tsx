import { Navigate, Route, Routes } from "react-router-dom";

import Layout from "./components/Layout";
import AnalyzerPage from "./pages/AnalyzerPage";
import HistoryPage from "./pages/HistoryPage";
import DetailPage from "./pages/DetailPage";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<AnalyzerPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/history/:id" element={<DetailPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
