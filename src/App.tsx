import "./App.css";
import { useState, useEffect, useRef } from "react";
import TitleScreen from "./components/TitleScreen";

// 国旗アイコン
import flagJa from "./assets/flags/flag-ja.png";
import flagEn from "./assets/flags/flag-en.png";
import flagZh from "./assets/flags/flag-zh.png";
import flagKo from "./assets/flags/flag-ko.png";
import flagEs from "./assets/flags/flag-es.png";
import flagFr from "./assets/flags/flag-fr.png";
import flagVi from "./assets/flags/flag-vi.png";
import flagEo from "./assets/flags/flag-eo.png"; // エスペラント

function App() {
  // タイトル画面の表示切り替え
  const [showTitle, setShowTitle] = useState(true);

  // 翻訳画面の状態
  const [isListening, setIsListening] = useState(false);
  const [status, setStatus] = useState("待機中");
  const [userText, setUserText] = useState("");
  const [responseText, setResponseText] = useState("");
  const recognitionRef = useRef<any>(null);

  // 言語リスト
  const languages = [
    { code: "ja", label: "JA", img: flagJa, tts: "ja-JP" },
    { code: "en", label: "EN", img: flagEn, tts: "en-US" },
    { code: "zh", label: "ZH", img: flagZh, tts: "zh-CN" },
    { code: "ko", label: "KO", img: flagKo, tts: "ko-KR" },
    { code: "es", label: "ES", img: flagEs, tts: "es-ES" },
    { code: "fr", label: "FR", img: flagFr, tts: "fr-FR" },
    { code: "vi", label: "VI", img: flagVi, tts: "vi-VN" },
    { code: "eo", label: "EO", img: flagEo, tts: "eo" },
  ];

  // Gemini 用の言語名
  const languageNames: any = {
    ja: "Japanese",
    en: "English",
    zh: "Chinese",
    ko: "Korean",
    es: "Spanish",
    fr: "French",
    vi: "Vietnamese",
    eo: "Esperanto",
  };

  // 入力言語（音声認識）
  const [inputLanguage, setInputLanguage] = useState("ja");

  // 翻訳先言語（Gemini + TTS）
  const [targetLanguage, setTargetLanguage] = useState("en");

  // 時間帯テーマ
  useEffect(() => {
    const hour = new Date().getHours();
    const body = document.body;

    body.classList.remove("morning", "day", "evening", "night");

    if (hour >= 5 && hour < 11) body.classList.add("morning");
    else if (hour >= 11 && hour < 16) body.classList.add("day");
    else if (hour >= 16 && hour < 19) body.classList.add("evening");
    else body.classList.add("night");
  }, []);

  // 音声認識セットアップ
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("このブラウザは音声認識に対応していません");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang =
      languages.find((l) => l.code === inputLanguage)?.tts || "ja-JP";
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onstart = () => setStatus("聞き取り中…");

    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      setUserText(text);
      generateResponse(text, targetLanguage);
    };

    recognition.onend = () => {
      setIsListening(false);
      setStatus("待機中");
    };

    recognitionRef.current = recognition;
  }, [inputLanguage, targetLanguage]);

  // TTS
  const speakText = (text: string) => {
    const langInfo = languages.find((l) => l.code === targetLanguage);
    if (!langInfo) return;

    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = langInfo.tts;
    utter.rate = 1.0;
    utter.pitch = 1.0;

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  };

  // 翻訳プロンプト
  const buildTranslationPrompt = (text: string, targetLang: string) => {
    const langName = languageNames[targetLang];
    return `
You are a translation engine.
Do not add explanations, comments, or extra text.
Translate the following text into ${langName}:
${text}
`;
  };

  // Gemini に問い合わせ
  const generateResponse = async (text: string, targetLang: string) => {
    setStatus("処理中…");

    const prompt = buildTranslationPrompt(text, targetLang);

    try {
      const res = await fetch("http://localhost:3001/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      const reply = data?.reply || "うまく返答できませんでした。";

      setResponseText(reply);
      setStatus("完了");
      speakText(reply);
    } catch (error) {
      console.error(error);
      setResponseText("エラーが発生しました。");
      setStatus("エラー");
    }
  };

  // マイク開始
  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  // ★ タイトル画面の表示
 if (showTitle) {
  return <TitleScreen onStart={() => setShowTitle(false)} />;
}

// ★ 時間帯テーマの判定（ここに入れる）
const hour = new Date().getHours();
let theme = "day";

if (hour < 5) theme = "night";
else if (hour < 11) theme = "morning";
else if (hour < 17) theme = "day";
else theme = "evening";

// ★ 翻訳画面
return (
  <div className={`app-container ${theme} translation-screen`}>

    {/* タイトルに戻るボタン */}
    <button className="back-button" onClick={() => setShowTitle(true)}>
      ↩︎
    </button>

    {/* 翻訳画面のタイトル */}
    <h1 className="title">ココロノキモチ</h1>

      <h2>あなたが話す言語</h2>
      <div className="language-selector">
        {languages.map((lang) => (
          <button
            key={lang.code}
            className={`lang-btn ${inputLanguage === lang.code ? "active" : ""}`}
            onClick={() => setInputLanguage(lang.code)}
          >
            <img src={lang.img} alt={lang.label} className="flag-img" />
            <span className="code">{lang.label}</span>
          </button>
        ))}
      </div>

      <h2>翻訳する言語</h2>
      <div className="language-selector">
        {languages.map((lang) => (
          <button
            key={lang.code}
            className={`lang-btn ${targetLanguage === lang.code ? "active" : ""}`}
            onClick={() => setTargetLanguage(lang.code)}
          >
            <img src={lang.img} alt={lang.label} className="flag-img" />
            <span className="code">{lang.label}</span>
          </button>
        ))}
      </div>

      <div className="status-badge">{status}</div>

      <button className="mic-button" onClick={startListening}>
        🎤
      </button>

      <div className="section">
        <h2>あなたの声</h2>
        <p>{userText}</p>
      </div>

      <div className="section">
        <h2>翻訳結果</h2>
        <p>{responseText}</p>

        {responseText && (
          <button className="tts-button" onClick={() => speakText(responseText)}>
            🔊 読み上げ
          </button>
        )}
      </div>
    </div>
  );
}

export default App;