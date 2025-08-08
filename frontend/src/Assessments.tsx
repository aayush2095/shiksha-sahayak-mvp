import React from 'react';
import './Placeholder.css'; // We will update this file next

const Assessments = () => {
  return (
    <div className="placeholder-container">
      <div className="feature-header">
        <div className="feature-icon">✅</div>
        <h2>Automated Assessment Grading</h2>
        <p>Upload handwritten answer sheets and get them graded instantly.</p>
      </div>
      
      <div className="feature-content">
        <button className="cta-button disabled" disabled>
          Grade New Assessment (Coming in Phase 2)
        </button>

        <div className="sample-data-section">
          <h4>Recently Graded</h4>
          <div className="sample-list">
            <div className="sample-item">
              <p>Class 7 - Science - Unit Test 1</p>
              <span>Avg. Score: 78%</span>
            </div>
            <div className="sample-item">
              <p>Class 6 - Maths - Chapter 4 Quiz</p>
              <span>Avg. Score: 85%</span>
            </div>
             <div className="sample-item">
              <p>Class 7 - Hindi - Term Exam</p>
              <span>Avg. Score: 67%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Assessments;