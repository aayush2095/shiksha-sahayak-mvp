import React from 'react';
import './Placeholder.css'; // This will use the same updated styles

const Reports = () => {
  return (
    <div className="placeholder-container">
      <div className="feature-header">
        <div className="feature-icon">📊</div>
        <h2>Compliance & Reporting Automation</h2>
        <p>Generate and submit government-required reports in seconds.</p>
      </div>

      <div className="feature-content">
        <button className="cta-button disabled" disabled>
          Generate New Report (Coming in Phase 3)
        </button>

        <div className="sample-data-section">
          <h4>Generated Reports</h4>
          <div className="sample-list">
            <div className="sample-item">
              <p>Monthly Attendance Summary - July 2025</p>
              <span>Status: Submitted</span>
            </div>
            <div className="sample-item">
              <p>Quarterly Learning Outcomes - Q2</p>
              <span>Status: Draft</span>
            </div>
             <div className="sample-item">
              <p>Annual Enrollment Report - 2024-25</p>
              <span>Status: Submitted</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;