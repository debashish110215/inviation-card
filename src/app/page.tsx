"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDown, ArrowUpRight, CalendarDays, ChevronLeft, ChevronRight, Clock3,
  Heart, MapPin, Music2, Pause, Play, Volume2, VolumeX, X
} from "lucide-react";
import Envelope from "@/components/Envelope";

const WEDDING_DATE = new Date("2026-12-12T18:00:00+06:00");
const MAP_QUERY = encodeURIComponent("The Royal Garden, Dhaka, Bangladesh");

const gallery = [
  { src: "/images/gallery-1.jpg", alt: "Wedding couple holding hands" },
  { src: "/images/gallery-2.jpg", alt: "Wedding celebration" },
  { src: "/images/gallery-3.jpg", alt: "Wedding ceremony details" },
  { src: "/images/gallery-4.jpg", alt: "Wedding flowers" },
  { src: "/images/gallery-5.jpg", alt: "Wedding table setting" },
  { src: "/images/gallery-6.jpg", alt: "Wedding couple celebration" },
];

const events = [
  { name: "Gaye Holud", date: "Friday, 11 December 2026", time: "4:00 PM – 8:00 PM", venue: "The Royal Garden, Dhaka", icon: "✿", note: "An evening of turmeric, music and joyful celebration." },
  { name: "Wedding Ceremony", date: "Saturday, 12 December 2026", time: "6:00 PM – 9:00 PM", venue: "The Royal Garden, Dhaka", icon: "♡", note: "The moment we begin our forever together." },
  { name: "Reception", date: "Saturday, 12 December 2026", time: "8:00 PM onwards", venue: "The Royal Garden, Dhaka", icon: "❋", note: "Dinner, laughter and memories with our favourite people." },
];

function useCountdown(target: Date) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  return useMemo(() => {
    if (now === null) return [0, 0, 0, 0];
    const distance = Math.max(0, target.getTime() - now);
    return [
      Math.floor(distance / 86400000),
      Math.floor((distance % 86400000) / 3600000),
      Math.floor((distance % 3600000) / 60000),
      Math.floor((distance % 60000) / 1000),
    ];
  }, [now, target]);
}

function Reveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        node.classList.add("is-visible");
        observer.unobserve(node);
      }
    }, { threshold: 0.12 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return <div ref={ref} className={`reveal ${className}`}>{children}</div>;
}

export default function Home() {
  const [envelopeDone, setEnvelopeDone] = useState(false);
  const [musicOn, setMusicOn] = useState(false);
  const [musicReady, setMusicReady] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);
  const [rsvp, setRsvp] = useState<"yes" | "no" | "">("");
  const [guestName, setGuestName] = useState("");
  const [rsvpSent, setRsvpSent] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const countdown = useCountdown(WEDDING_DATE);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onCanPlay = () => setMusicReady(true);
    audio.addEventListener("canplay", onCanPlay);
    return () => audio.removeEventListener("canplay", onCanPlay);
  }, []);

  const toggleMusic = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (musicOn) {
      audio.pause();
      setMusicOn(false);
      return;
    }
    try {
      await audio.play();
      setMusicOn(true);
    } catch {
      setMusicOn(false);
      alert("Add your licensed music file at public/music/wedding.mp3, then try again.");
    }
  };

  // Opening the envelope is a user gesture, so try to start the song quietly.
  const startMusicQuietly = () => {
    const audio = audioRef.current;
    if (!audio || musicOn) return;
    audio.play().then(() => setMusicOn(true)).catch(() => setMusicOn(false));
  };

  const submitRsvp =(e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !rsvp) return;
    setRsvpSent(true);
  };

  const closeLightbox = () => setSelectedPhoto(null);

  return (
    <main>
      <audio ref={audioRef} src="/music/wedding.mp3" loop preload="none" />
      {!envelopeDone && <Envelope onOpen={startMusicQuietly} onDone={() => setEnvelopeDone(true)} />}

      <nav className="top-nav">
        <a className="brand" href="#top">A <span>&</span> A</a>
        <div className="nav-links">
          <a href="#events">Events</a><a href="#story">Our Story</a><a href="#gallery">Gallery</a><a href="#rsvp">RSVP</a>
        </div>
        <button className="music-nav" onClick={toggleMusic} aria-label={musicOn ? "Pause music" : "Play music"}>
          {musicOn ? <Pause size={15}/> : <Music2 size={15}/>} <span>{musicOn ? "Pause" : "Music"}</span>
        </button>
      </nav>

      <section className="hero" id="top">
        <div className="hero-glow" />
        <div className="ornament ornament-top">✦　❀　✦</div>
        <div className="invitation-cover">
          <div className="cover-inner">
            <div className="rings">♧</div>
            <p className="eyebrow">Together with our families</p>
            <h1>Wedding<br/><em>Invitation</em></h1>
            <div className="gold-rule"><span>✧</span></div>
            <p className="cover-names">Aarav <i>&</i> Ananya</p>
            <p className="cover-date">12 · 12 · 2026</p>
            <a className="open-button" href="#welcome">
              Explore invitation <ArrowDown size={15}/>
            </a>
          </div>
        </div>
        <p className="hero-hint">A little invitation, a lifetime of memories</p>
        <div className="scroll-cue"><span/> SCROLL TO DISCOVER</div>
      </section>

      <section className="welcome section-light" id="welcome">
        <Reveal>
          <p className="eyebrow dark">With love and blessings</p>
          <div className="mini-flower">❀</div>
          <h2>Two hearts.<br/><em>One beautiful journey.</em></h2>
          <p className="welcome-copy">Together with our beloved families, we invite you to share in the joy as we begin our forever.</p>
          <div className="couple-names"><span>Aarav</span><b>&</b><span>Ananya</span></div>
          <p className="date-line">SATURDAY · 12 DECEMBER 2026 · DHAKA</p>
        </Reveal>
      </section>

      <section className="countdown-section">
        <Reveal>
          <p className="eyebrow">The celebration begins in</p>
          <h2>A day to remember</h2>
          <div className="countdown-grid">
            {countdown.map((value, index) => <div className="count-box" key={index}><strong>{String(value).padStart(2, "0")}</strong><span>{["Days", "Hours", "Minutes", "Seconds"][index]}</span></div>)}
          </div>
          <p className="countdown-note">Until we say “I do”</p>
        </Reveal>
      </section>

      <section className="story section-light" id="story">
        <Reveal className="story-grid">
          <div className="story-image">
            <img src={gallery[0].src} alt="A couple celebrating their wedding" />
            <span className="image-caption">A new chapter begins</span>
          </div>
          <div className="story-copy">
            <p className="eyebrow dark">A note from our hearts</p>
            <h2>Our <em>Story</em></h2>
            <div className="gold-rule"><span>✧</span></div>
            <p>Some journeys are written in the stars. Ours began with a simple hello, grew through countless little moments, and became a promise to walk through life together.</p>
            <p>Now, surrounded by the people we love most, we cannot wait to celebrate this beautiful beginning with you.</p>
            <p className="signature">With love, Aarav & Ananya</p>
          </div>
        </Reveal>
      </section>

      <section className="events-section" id="events">
        <Reveal>
          <p className="eyebrow">Save the dates</p>
          <h2>Our <em>Celebrations</em></h2>
          <p className="section-intro">Three moments, one unforgettable celebration. We would love to have you with us.</p>
          <div className="event-grid">
            {events.map((event, i) => <article className="event-card" key={event.name}>
              <div className="event-icon">{event.icon}</div>
              <span className="event-number">0{i + 1}</span>
              <h3>{event.name}</h3>
              <p className="event-date"><CalendarDays size={15}/>{event.date}</p>
              <p className="event-time"><Clock3 size={15}/>{event.time}</p>
              <p className="event-venue"><MapPin size={15}/>{event.venue}</p>
              <p className="event-note">{event.note}</p>
              <a className="text-link" href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.name + " - Aarav & Ananya")}&dates=${i === 0 ? "20261211T100000Z/20261211T140000Z" : i === 1 ? "20261212T120000Z/20261212T150000Z" : "20261212T140000Z/20261212T170000Z"}&location=${MAP_QUERY}`} target="_blank" rel="noreferrer">Add to calendar <ArrowUpRight size={14}/></a>
            </article>)}
          </div>
        </Reveal>
      </section>

      <section className="schedule section-light">
        <Reveal>
          <p className="eyebrow dark">Mark your calendar</p>
          <h2>The <em>Schedule</em></h2>
          <div className="timeline">
            {events.map((event, i) => <div className="timeline-item" key={event.name}>
              <div className="timeline-dot">{i + 1}</div>
              <div className="timeline-content"><span className="timeline-date">{event.date}</span><h3>{event.name}</h3><p><Clock3 size={14}/> {event.time}</p><p><MapPin size={14}/> {event.venue}</p></div>
            </div>)}
          </div>
        </Reveal>
      </section>

      <section className="location-section">
        <Reveal className="location-grid">
          <div>
            <p className="eyebrow">Find your way</p>
            <h2>Meet us <em>there</em></h2>
            <p className="location-description">We will be waiting to welcome you at a place filled with warmth, laughter and celebration.</p>
            <div className="venue-card"><MapPin size={20}/><div><strong>The Royal Garden</strong><span>Dhaka, Bangladesh</span></div></div>
            <a className="gold-button" href={`https://www.google.com/maps/search/?api=1&query=${MAP_QUERY}`} target="_blank" rel="noreferrer">Open in Google Maps <ArrowUpRight size={16}/></a>
          </div>
          <div className="map-frame"><iframe title="Map showing The Royal Garden, Dhaka" src={`https://www.google.com/maps?q=${MAP_QUERY}&output=embed`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" /></div>
        </Reveal>
      </section>

      <section className="gallery-section" id="gallery">
        <Reveal>
          <p className="eyebrow">Little moments, forever memories</p>
          <h2>Our <em>Gallery</em></h2>
          <p className="section-intro">A few frames from the story we are writing together.</p>
          <div className="gallery-grid">
            {gallery.map((photo, i) => <button className={`gallery-photo photo-${i + 1}`} key={photo.src} onClick={() => setSelectedPhoto(i)} aria-label={`View photo ${i + 1}`}>
              <img src={photo.src} alt={photo.alt} loading="lazy"/><span>View photo ↗</span>
            </button>)}
          </div>
        </Reveal>
      </section>

      <section className="music-section section-light">
        <Reveal>
          <div className="music-disc"><span>♪</span></div>
          <p className="eyebrow dark">A soundtrack for our day</p>
          <h2>Our <em>Wedding Song</em></h2>
          <p className="music-copy">A little music makes every memory sweeter.</p>
          <button className="play-button" onClick={toggleMusic}>{musicOn ? <Pause size={18}/> : <Play size={18} fill="currentColor"/>}{musicOn ? "Pause music" : "Play our song"}</button>
          <p className="music-status">{musicReady ? "Music is ready" : "Add your own song to make this moment yours"}</p>
        </Reveal>
      </section>

      <section className="rsvp-section" id="rsvp">
        <Reveal>
          <p className="eyebrow">We saved you a place</p>
          <h2>Will you <em>join us?</em></h2>
          {rsvpSent ? <div className="rsvp-success"><Heart size={28} fill="currentColor"/><h3>Thank you, {guestName}!</h3><p>Your response has been recorded in this preview.</p></div> :
            <form className="rsvp-form" onSubmit={submitRsvp}>
              <label htmlFor="guest-name">Your name</label>
              <input id="guest-name" value={guestName} onChange={e => setGuestName(e.target.value)} placeholder="Enter your name" required/>
              <label>Will you be attending?</label>
              <div className="rsvp-options">
                <button type="button" className={rsvp === "yes" ? "chosen" : ""} onClick={() => setRsvp("yes")}>Joyfully accepts</button>
                <button type="button" className={rsvp === "no" ? "chosen" : ""} onClick={() => setRsvp("no")}>Regretfully declines</button>
              </div>
              <button className="gold-button submit-button" type="submit" disabled={!rsvp}>Send response <ArrowUpRight size={16}/></button>
              <small>This demo stores your response only in the current browser session. Connect an API to collect real RSVPs.</small>
            </form>}
        </Reveal>
      </section>

      <footer className="footer">
        <div className="footer-flower">❀</div>
        <h2>Thank <em>You</em></h2>
        <p>Your presence is the greatest gift. We cannot wait to celebrate with you.</p>
        <div className="footer-names">Aarav <span>&</span> Ananya</div>
        <p className="footer-date">12 · 12 · 2026</p>
        <div className="footer-line"/>
        <span className="footer-small">MADE WITH LOVE · DHAKA, BANGLADESH</span>
      </footer>

      {selectedPhoto !== null && <div className="lightbox" role="dialog" aria-modal="true" aria-label="Photo viewer" onClick={closeLightbox}>
        <button className="lightbox-close" onClick={closeLightbox} aria-label="Close photo"><X/></button>
        <button className="lightbox-prev" onClick={e => { e.stopPropagation(); setSelectedPhoto((selectedPhoto + gallery.length - 1) % gallery.length); }} aria-label="Previous photo"><ChevronLeft/></button>
        <img src={gallery[selectedPhoto].src} alt={gallery[selectedPhoto].alt} onClick={e => e.stopPropagation()}/>
        <button className="lightbox-next" onClick={e => { e.stopPropagation(); setSelectedPhoto((selectedPhoto + 1) % gallery.length); }} aria-label="Next photo"><ChevronRight/></button>
      </div>}
    </main>
  );
}
