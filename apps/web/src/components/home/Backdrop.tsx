// Behind the whole landing page: soft colour blobs drifting very slowly, and a
// fine grain that gives the flat colours a printed, paper-like feel.
export function Backdrop() {
  return (
    <div className="home-backdrop" aria-hidden="true">
      <span className="home-blob home-blob-a" />
      <span className="home-blob home-blob-b" />
      <span className="home-blob home-blob-c" />
      <svg className="home-grain" width="100%" height="100%">
        <filter id="home-grain-filter">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#home-grain-filter)" />
      </svg>
    </div>
  );
}
