import { useState } from 'react';
import s from './StarRating.module.css';

export default function StarRating({ rating, size = 14, interactive = false, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div className={s.wrap}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={`${s.star} ${i <= (hover || rating) ? s.on : ''}`}
          style={{ fontSize: size, cursor: interactive ? 'pointer' : 'default' }}
          onClick={() => interactive && onChange?.(i)}
          onMouseEnter={() => interactive && setHover(i)}
          onMouseLeave={() => interactive && setHover(0)}
        >★</span>
      ))}
    </div>
  );
}
