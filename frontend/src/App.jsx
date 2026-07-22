import { useState } from "react";
import SentimentTab from "./tabs/SentimentTab";
import NERTab from "./tabs/NERTab";
import SummarizeTab from "./tabs/SummarizeTab";
import TranslateTab from "./tabs/TranslateTab";
import ZeroShotTab from "./tabs/ZeroShotTab";
import SearchTab from "./tabs/SearchTab";
import GenerateTab from "./tabs/GenerateTab";
import "./App.css";

const TABS = [
  { id: "sentiment", label: "Sentiment" },
  { id: "ner", label: "NER" },
  { id: "summarize", label: "Summarize" },
  { id: "translate", label: "Translate" },
  { id: "zeroshot", label: "Zero-Shot" },
  { id: "search", label: "Search" },
  { id: "generate", label: "Generate" },
];

function App() {
  const [activeTab, setActiveTab] = useState("sentiment");

  return (
    <div className="app">
      <h1>NLP Toolkit</h1>
      <div className="tab-bar">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={activeTab === tab.id ? "tab active" : "tab"}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="tab-content">
        {activeTab === "sentiment" && <SentimentTab />}
        {activeTab === "ner" && <NERTab />}
        {activeTab === "summarize" && <SummarizeTab />}
        {activeTab === "translate" && <TranslateTab />}
        {activeTab === "zeroshot" && <ZeroShotTab />}
        {activeTab === "search" && <SearchTab />}
        {activeTab === "generate" && <GenerateTab />}
      </div>
    </div>
  );
}

export default App;