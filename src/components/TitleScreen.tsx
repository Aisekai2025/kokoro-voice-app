import "../styles/title.css";
import Logo from "../assets/logo/logo-heartwave.png";

function TitleScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="title-screen">
      <img src={Logo} alt="logo" className="title-logo" />

      <h1 className="title-main">ココロノキモチ</h1>

      <p className="title-sub">声でつながる翻訳学習アプリ</p>

      <button className="start-button" onClick={onStart}>
        🎤 はじめる
      </button>
    </div>
  );
}

export default TitleScreen;  // ← これが必須！