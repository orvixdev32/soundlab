import TopBar from './components/layout/TopBar';
import './App.css';

function App() {
  return (
    <main className="page" id="home">
      <TopBar />

      <section className="hero-content" aria-labelledby="hero-title">
        <h1 id="hero-title">
          Sound for the state of mind.
        </h1>

        <p className="hero-description">
          Find your atmosphere. Create your space.
        </p>

        <div className="hero-actions">
          <a className="button button-primary" href="#scenes">
            <span>Start Now</span>
          </a>

          <button
            className="button button-secondary"
            type="button"
            title="Звукове прев'ю ще не реалізовано"
          >
            <span>Preview Sound</span>
          </button>
        </div>
      </section>
    </main>
  );
}

export default App;