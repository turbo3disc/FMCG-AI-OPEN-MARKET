// Offline fallback — shown when the device has no network (PWA).
export default function OfflinePage() {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
      <div style={{ fontSize: 48 }}>◉</div>
      <h1>You are offline</h1>
      <p className="sub">
        No internet connection. Your seller POS, cart and chats saved on this
        device keep working — everything syncs when you are back online.
      </p>
      <div className="btn-row" style={{ justifyContent: 'center', marginTop: 16 }}>
        <a href="/" className="btn btn-primary">Try home</a>
        <a href="/pos" className="btn btn-outline">Open outlet POS</a>
      </div>
    </div>
  );
}
