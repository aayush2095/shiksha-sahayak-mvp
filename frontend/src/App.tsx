import React, { useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import Dashboard from './Dashboard';
import Assessments from './Assessments'; // Import new components
import Reports from './Reports';
import './App.css';

// --- Icon Components ---
const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const PlannerIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>;
const CheckSquareIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>;
const BarChartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="20" y2="10"/><line x1="18" x2="18" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="16"/></svg>;

// --- Main App Component ---
function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [language, setLanguage] = useState('hindi');
  const [gradeLevel, setGradeLevel] = useState('Class 7');
  const [subject, setSubject] = useState('Science');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState('');
  const [error, setError] = useState('');
  const [extractedText, setExtractedText] = useState('');
  const [generatedContent, setGeneratedContent] = useState<any>(null);

  const handleFileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) { setError('Please select a file.'); return; }
    setLoading('extracting');
    setError('');
    setExtractedText('');
    setGeneratedContent(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await axios.post('/api/v1/extract-text-from-image', formData);
      setExtractedText(response.data.extracted_text || "AI could not read the text. Please type or paste it here.");
    } catch (err: any) {
      setError('Failed to extract text from image.');
    } finally { setLoading(''); }
  };

  const handleContentGeneration = async () => {
    if (!extractedText) { setError('Cannot generate content from empty text.'); return; }
    setLoading('generating');
    setError('');
    setGeneratedContent(null);
    try {
      const payload = { language, grade_level: gradeLevel, subject, extracted_text: extractedText };
      const response = await axios.post('/api/v1/generate-content-from-text', payload);
      setGeneratedContent(response.data);
    } catch (err: any) {
      setError('Failed to generate materials.');
    } finally { setLoading(''); }
  };

  const ResultCard = ({ title, content }: { title: string, content: string }) => (
    <div className="result-card"><h3>{title}</h3><div className="markdown-content"><ReactMarkdown>{content}</ReactMarkdown></div></div>
  );

  const LessonPlanner = () => (
    <>
      <div className="workflow-step">
        <div className="step-header"><h2>1. Upload Syllabus & Extract Text</h2></div>
        <form onSubmit={handleFileSubmit} className="upload-form">
          <div className="form-group"><label>Language</label><select value={language} onChange={(e) => setLanguage(e.target.value)}><option value="hindi">Hindi</option><option value="tamil">Tamil</option><option value="assamese">Assamese</option></select></div>
          <div className="form-group"><label>Grade Level</label><input type="text" value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)} /></div>
          <div className="form-group"><label>Subject</label><input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} /></div>
          <div className="form-group"><label>Syllabus File (Image)</label><input type="file" accept="image/*" onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} /></div>
          <button type="submit" disabled={!!loading}> {loading === 'extracting' ? 'Reading Image...' : 'Extract Text'} </button>
        </form>
      </div>
      {loading === 'extracting' && <div className="loading-state"><div className="spinner"></div></div>}
      {extractedText && (
        <div className="workflow-step">
          <div className="step-header"><h2>2. Verify Text & Generate Materials</h2></div>
          <div className="extracted-text-section"><label>Extracted / Corrected Text</label><textarea value={extractedText} onChange={(e) => setExtractedText(e.target.value)} rows={8}></textarea><button onClick={handleContentGeneration} disabled={!!loading}> {loading === 'generating' ? 'Generating...' : 'Generate Materials'} </button></div>
        </div>
      )}
      {error && <div className="error-message">{error}</div>}
    </>
  );

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard': return <Dashboard />;
      case 'planner': return (
        <div className="planner-view">
          <div className="planner-controls"><LessonPlanner /></div>
          <div className="planner-results">
            {loading === 'generating' && <div className="loading-state"><div className="spinner"></div><p>AI is working...</p></div>}
            {!loading && !generatedContent && <div className="placeholder"><h3>Generated Materials Will Appear Here</h3></div>}
            {generatedContent && generatedContent.success && (
              <div className="results-grid">
                <ResultCard title="Lesson Plan" content={generatedContent.lesson_plan} />
                <ResultCard title="Worksheet" content={generatedContent.worksheet} />
                <ResultCard title="Quiz" content={generatedContent.quiz} />
              </div>
            )}
          </div>
        </div>
      );
      case 'assessments': return <Assessments />;
      case 'reports': return <Reports />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="app-container">
      <aside className="sidebar">
        <header><h1>Shiksha Sahayak 🇮🇳</h1><p>AI Teaching Assistant</p></header>
        <nav className="main-nav">
          <a href="#" className={activeView === 'dashboard' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActiveView('dashboard'); }}><HomeIcon /> Dashboard</a>
          <a href="#" className={activeView === 'planner' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActiveView('planner'); }}><PlannerIcon /> Lesson Planner</a>
          <a href="#" className={activeView === 'assessments' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActiveView('assessments'); }}><CheckSquareIcon /> Assessments</a>
          <a href="#" className={activeView === 'reports' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActiveView('reports'); }}><BarChartIcon /> Reports</a>
        </nav>
        <div className="sidebar-footer"><p>Version 1.0 (MVP)</p></div>
      </aside>
      <main className="main-content">{renderActiveView()}</main>
    </div>
  );
}

export default App;