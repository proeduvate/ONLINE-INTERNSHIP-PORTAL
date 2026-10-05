import "../styles/Dashboard.css";

export default function TaskPage() {
  return (
    <div className="main">
      <h2>Task Page</h2>

      <div className="card">
        <h3>MCQ</h3>
        <p>What is React?</p>
        <button className="btn">Library</button>
        <button className="btn">Language</button>
      </div>

      <div className="card">
        <h3>Code Submission</h3>
        <textarea rows="5" style={{width:"100%"}} />
        <br /><br />
        <button className="btn">Submit</button>
      </div>
    </div>
  );
}