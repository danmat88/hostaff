import { useState } from 'react';
import { HOSTS } from '../../data/hosts';
import StarRating from '../StarRating/StarRating';
import s from './WriteReview.module.css';

export default function WriteReview({ onSubmit }) {
  const [hostId, setHostId] = useState(1);
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [done, setDone] = useState(false);

  const host = HOSTS.find((h) => h.id === hostId);
  const valid = rating > 0 && title.trim().length > 2 && text.trim().length > 10;

  const submit = () => {
    if (!valid) return;
    onSubmit?.({
      id: Date.now(), hostId, user: 'you', avatar: 'YO', rating,
      date: new Date().toISOString().split('T')[0],
      title: title.trim(), text: text.trim(), helpful: 0, verified: false,
    });
    setDone(true);
    setTimeout(() => { setDone(false); setTitle(''); setText(''); setRating(0); }, 3000);
  };

  return (
    <section className={s.section}>
      <div className={s.header}>
        <h2 className={s.title}>Write a Review</h2>
        <p className={s.subtitle}>Share your hosting experience with the community</p>
      </div>

      <div className={s.form}>
        {done ? (
          <div className={s.success}>
            <div className={s.successIcon}>✓</div>
            <h3>Review Submitted!</h3>
            <p>Thanks for contributing to the community.</p>
          </div>
        ) : (
          <>
            <div className={s.row2}>
              <div className={s.field}>
                <label className={s.label}>Select Host</label>
                <select className={s.select} value={hostId} onChange={(e) => setHostId(+e.target.value)}>
                  {HOSTS.map((h) => <option key={h.id} value={h.id}>{h.logo} {h.name}</option>)}
                </select>
              </div>
              <div className={s.field}>
                <label className={s.label}>Your Rating</label>
                <div className={s.ratingField}>
                  <StarRating rating={rating} size={24} interactive onChange={setRating} />
                  {rating > 0 && <span className={s.ratingWord}>{['','Poor','Fair','Good','Great','Excellent'][rating]}</span>}
                </div>
              </div>
            </div>

            <div className={s.field}>
              <label className={s.label}>Review Title</label>
              <input className={s.input} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Summarize your experience..." maxLength={100} />
              <span className={s.counter}>{title.length}/100</span>
            </div>

            <div className={s.field}>
              <label className={s.label}>Your Review</label>
              <textarea className={s.textarea} value={text} onChange={(e) => setText(e.target.value)} placeholder="What worked well? What could be improved? Be specific to help others." rows={6} maxLength={600} />
              <span className={s.counter}>{text.length}/600</span>
            </div>

            <div className={s.footer}>
              <p className={s.note}>Reviews are moderated before publishing. Be honest and constructive.</p>
              <button className={`${s.btn} ${valid ? s.btnValid : ''}`} onClick={submit} disabled={!valid} style={valid ? { background: host.color } : {}}>
                Submit Review
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
