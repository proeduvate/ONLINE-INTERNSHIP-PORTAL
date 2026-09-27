import re

with open("frontend/src/pages/Dashboard/MentorDashboard.jsx", "r", encoding="utf-8") as f:
    text = f.read()

replacement = """
  const [submissions, setSubmissions] = useState([]);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { default: api } = await import('../../api/axios');
        const [airdropsRes, subsRes] = await Promise.all([
            api.get('/api/features/airdrops'),
            api.get('/api/submissions/pending')
        ]);
        setBonusAirdrops(airdropsRes.data);
        setSubmissions(subsRes.data);
      } catch (err) {
        console.error("Failed to fetch mentor data", err);
      }
    };
    fetchData();
  }, []);

  const handleEvaluate = async (id, mentor_score, mentor_feedback) => {
    try {
        const { default: api } = await import('../../api/axios');
        await api.put(`/api/submissions/${id}/evaluate`, { mentor_score: parseInt(mentor_score), mentor_feedback });
        
        // Remove from pending
        setSubmissions(submissions.filter(s => s.id !== id));
        alert("Evaluation submitted!");
    } catch(err) {
        alert("Evaluation failed");
    }
  };
"""

text = re.sub(r'  useEffect\(\(\) => \{\n    const storedAirdrops.*?\n  \}, \[\]\);', replacement, text, flags=re.DOTALL)
text = re.sub(r'const \[submissions, setSubmissions\] = useState\(\[.*?\]\);', '', text, flags=re.DOTALL)

with open("frontend/src/pages/Dashboard/MentorDashboard.jsx", "w", encoding="utf-8") as f:
    f.write(text)
