export default function TripsLoading() {
  return (
    <main className="trips-page" aria-busy="true" aria-label="Carregando viagens">
      <div className="trips-loading-shell">
        <div className="trip-loading-line wide" />
        <div className="trip-loading-line" />
        <div className="trips-loading-grid">
          <div className="trip-loading-card" />
          <div className="trip-loading-card" />
        </div>
      </div>
    </main>
  );
}
