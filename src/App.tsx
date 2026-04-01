import { BrowserRouter, Routes, Route } from "react-router-dom"
import { ModeToggle } from "@/components/mode-toggle"
import { HomePage } from "@/pages/HomePage"
import { TestPage } from "@/pages/TestPage"
import { HistoryPage } from "@/pages/HistoryPage"

export default function App() {
  return (
    <BrowserRouter>
      <div className="fixed top-4 right-4 z-50">
        <ModeToggle />
      </div>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/test" element={<TestPage />} />
        <Route path="/history" element={<HistoryPage />} />
      </Routes>
    </BrowserRouter>
  )
}
