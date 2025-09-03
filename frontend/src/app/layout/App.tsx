import { Routes, Route, Link } from 'react-router-dom'
import './App.css'

function Home() {
  return <div>Home</div>
}

function About() {
  return <div>About</div>
}

export default function App() {
  return (
    <div>
      <nav style={{ display: 'flex', gap: 12 }}>
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </div>
  )
}
