interface StartProps {
  onStart: () => void;
}

export default function Start({ onStart }: StartProps) {
  return (
    <div className="start-page">
      <h1 className="start-title">Planty</h1>
      <p className="start-subtitle">Plant your memories, Warp to your friends.</p>
      <button className="start-button" onClick={onStart}>START</button>
    </div>
  );
}