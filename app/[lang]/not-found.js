export default function NotFound() {
  return (
    <main id="app">
      <div className="wrap" style={{ paddingBlock: 120, textAlign: "center" }}>
        <h2>Sayfa bulunamadı<span className="hl">.</span></h2>
        <p className="lead" style={{ margin: "14px auto 24px" }}>Page not found.</p>
        <a className="btn pill" href="/tr/makineler">Makineler / Machines</a>
      </div>
    </main>
  );
}
