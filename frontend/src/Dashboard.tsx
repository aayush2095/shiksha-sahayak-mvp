import './Dashboard.css'; // We will create this file next

const StatCard = ({ title, value, icon }: { title: string, value: string, icon: string }) => (
  <div className="stat-card">
    <div className="stat-icon">{icon}</div>
    <div className="stat-info">
      <p>{title}</p>
      <h3>{value}</h3>
    </div>
  </div>
);

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Teacher Dashboard</h2>
        <p>Welcome back! Here's a summary of your activity.</p>
      </div>
      <div className="stats-grid">
        <StatCard title="Time Saved This Week" value="~3 Hours" icon="⏰" />
        <StatCard title="Lesson Plans Created" value="4" icon="📚" />
        <StatCard title="Assessments Generated" value="8" icon="✅" />
        <StatCard title="Student Reports" value="12" icon="📊" />
      </div>
      <div className="fake-door-section">
        <h3>More Features Coming Soon</h3>
        <div className="features-grid">
          <div className="feature-card disabled">
            <h4>Handwritten Answer Sheet Grading</h4>
            <p>Automatically grade scanned answer sheets. (Coming in Phase 2)</p>
          </div>
          <div className="feature-card disabled">
            <h4>Compliance & Reporting Automation</h4>
            <p>Generate government-required reports with one click. (Coming in Phase 3)</p>
          </div>
           <div className="feature-card disabled">
            <h4>Parent/Community Updates</h4>
            <p>Send progress updates via SMS or printouts. (Coming in Phase 3)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;