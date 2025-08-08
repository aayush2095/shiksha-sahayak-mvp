import React, { useState, type JSX } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import './App.css'; // This will hold our new component styles

// --- Icon Components for a more professional look ---
const BookIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/></svg>;
const BrainIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v0A2.5 2.5 0 0 1 9.5 7h-3A2.5 2.5 0 0 1 4 4.5v0A2.5 2.5 0 0 1 6.5 2h3Z"/><path d="M14.5 2A2.5 2.5 0 0 1 17 4.5v0A2.5 2.5 0 0 1 14.5 7h-3a2.5 2.5 0 0 1-2.5-2.5v0A2.5 2.5 0 0 1 11.5 2h3Z"/><path d="M4 12v3a2 2 0 0 0 2 2h2"/><path d="M16 12v3a2 2 0 0 1-2 2h-2"/></svg>;
const ClipboardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></svg>;
const CheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;

function App() {
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
    if (!file) { setError('Please select a syllabus file to upload.'); return; }
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
    } finally {
      setLoading('');
    }
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
    } finally {
      setLoading('');
    }
  };

  const ResultCard = ({ title, content, icon }: { title: string, content: string, icon: JSX.Element }) => (
    <div className="result-card">
      <div className="result-card-header">
        <div className="result-card-icon">{icon}</div>
        <h3>{title}</h3>
      </div>
      <div className="markdown-content"><ReactMarkdown>{content}</ReactMarkdown></div>
    </div>
  );

  return (
    <div className="app-container">
      <aside className="sidebar">
        <header>
          <h1>Shiksha Sahayak <span>MVP</span> 🇮🇳</h1>
          <p>AI Teaching Assistant</p>
        </header>
        
        <div className="workflow-step">
          <div className="step-header">
            <div className="step-number">1</div>
            <h2>Upload Syllabus</h2>
          </div>
          <form onSubmit={handleFileSubmit} className="upload-form">
            <div className="form-group"><label>Language</label><select value={language} onChange={(e) => setLanguage(e.target.value)}><option value="hindi">Hindi</option><option value="tamil">Tamil</option><option value="assamese">Assamese</option></select></div>
            <div className="form-group"><label>Grade Level</label><input type="text" value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)} /></div>
            <div className="form-group"><label>Subject</label><input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} /></div>
            <div className="form-group"><label>Syllabus File (Image)</label><input type="file" accept="image/*" onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} /></div>
            <button type="submit" disabled={!!loading}> {loading === 'extracting' ? 'Reading Image...' : 'Extract Text'} </button>
          </form>
        </div>

        {extractedText && (
          <div className="workflow-step">
            <div className="step-header">
              <div className="step-number">2</div>
              <h2>Verify & Generate</h2>
            </div>
            <div className="extracted-text-section">
              <label>Extracted / Corrected Text</label>
              <textarea value={extractedText} onChange={(e) => setExtractedText(e.target.value)} rows={8}></textarea>
              <button onClick={handleContentGeneration} disabled={!!loading}> {loading === 'generating' ? 'Generating...' : 'Generate Materials'} </button>
            </div>
          </div>
        )}
      </aside>

      <main className="main-content">
        {loading && <div className="loading-state"><div className="spinner"></div><p>AI is working its magic...</p></div>}
        {error && <div className="error-message">{error}</div>}
        {!loading && !error && !generatedContent && (
          <div className="placeholder">
            <BrainIcon />
            <h2>Your AI-Generated Materials Will Appear Here</h2>
            <p>Complete the steps on the left to begin.</p>
          </div>
        )}
        
        {generatedContent && generatedContent.success && (
          <div className="results-grid">
            <ResultCard icon={<BookIcon />} title="Lesson Plan" content={generatedContent.lesson_plan} />
            <ResultCard icon={<ClipboardIcon />} title="Worksheet" content={generatedContent.worksheet} />
            <ResultCard icon={<CheckIcon />} title="Quiz" content={generatedContent.quiz} />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;