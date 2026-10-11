// Messages — buyer ↔ seller chat. Buyers land here from Chat buttons
// (/messages?to=<sellerKey>); sellers open their inbox (/messages?as=seller,
// linked from the sub-admin dashboard).
'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import {
  getThreadsServerSnapshot, getThreadsSnapshot, markRead, sellerByKey,
  sellerDirectory, sendMessage, subscribeChat, unreadCount,
} from '../../lib/chat';

export default function MessagesPage({ searchParams }: { searchParams: { to?: string; as?: string } }) {
  const side = searchParams.as === 'seller' ? 'seller' : 'buyer';
  const threads = useSyncExternalStore(subscribeChat, getThreadsSnapshot, getThreadsServerSnapshot);
  const [active, setActive] = useState<string>(searchParams.to ?? '');
  const [draft, setDraft] = useState('');

  useEffect(() => {
    if (searchParams.to) setActive(searchParams.to);
  }, [searchParams.to]);

  const thread = threads.find((t) => t.sellerKey === active)
    ?? (active && sellerByKey(active)
      ? { sellerKey: active, messages: [], lastReadBuyer: 0, lastReadSeller: 0 }
      : null);
  const seller = active ? sellerByKey(active) : null;
  const directory = sellerDirectory();

  useEffect(() => {
    if (active) markRead(active, side);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, threads.length]);

  function send() {
    if (!active || !draft.trim()) return;
    sendMessage(active, side, draft);
    setDraft('');
  }

  return (
    <div>
      <h1>Messages {side === 'seller' ? '(seller inbox)' : ''}</h1>
      <p className="sub">
        {side === 'seller'
          ? <>Answer buyers fast — quick replies win the sale. <a href="/messages">Buyer view →</a></>
          : <>Chat directly with any seller. <a href="/messages?as=seller">Seller inbox →</a></>}
        {' '}• {unreadCount(side)} unread
      </p>
      <div className="grid g2" style={{ marginTop: 12, alignItems: 'start' }}>
        <div className="card">
          <h3>{side === 'seller' ? 'Conversations' : 'My chats'}</h3>
          {threads.length === 0 && <p className="sub">No chats yet — press <b>Chat</b> on any nearby seller.</p>}
          {threads.map((t) => {
            const s = sellerByKey(t.sellerKey);
            const last = t.messages.length ? t.messages[t.messages.length - 1] : null;
            return (
              <button key={t.sellerKey} onClick={() => setActive(t.sellerKey)}
                className="card" style={{ display: 'block', width: '100%', textAlign: 'left', marginBottom: 8, borderColor: active === t.sellerKey ? 'var(--primary)' : undefined }}>
                <b>{s?.name ?? t.sellerKey}</b>
                <div className="sub">{last ? `${last.from === side ? 'You' : s?.name}: ${last.text.slice(0, 60)}` : 'Say hello!'}</div>
              </button>
            );
          })}
          {side === 'buyer' && (
            <div style={{ marginTop: 12 }}>
              <div className="kicker">Start a new chat</div>
              {directory.slice(0, 6).map((s) => (
                <div key={s.key} style={{ marginTop: 6 }}>
                  <button className="btn btn-outline" onClick={() => setActive(s.key)}>Chat {s.name}</button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="card">
          {!thread && <p className="sub">Pick a conversation to start chatting.</p>}
          {thread && (
            <div>
              <h3>{seller?.name ?? active} <span className="sub">• {seller?.market}</span></h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, margin: '12px 0', maxHeight: 320, overflowY: 'auto' }}>
                {thread.messages.length === 0 && <p className="sub">No messages yet — say hello!</p>}
                {thread.messages.map((m) => (
                  <div key={m.id} className={m.from === side ? 'quote-ver accepted' : 'quote-ver'}>
                    <span className="who">{m.from === side ? 'You' : (seller?.name ?? 'Seller')}:</span> {m.text}
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input placeholder="Type a message…" value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') send(); }} />
                <button className="btn btn-primary" onClick={send}>Send</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
