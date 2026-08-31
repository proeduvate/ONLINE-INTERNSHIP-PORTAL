import re

with open("frontend/src/pages/Dashboard/InternDashboard.jsx", "r", encoding="utf-8") as f:
    text = f.read()

replacement = """
  // State for fetched APIs
  const [tasks, setTasks] = useState([]);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { default: api } = await import('../../api/axios');
        const [airdropsRes, tasksRes] = await Promise.all([
            api.get('/api/features/airdrops'),
            api.get('/api/tasks/my-tasks')
        ]);
        setBonusAirdrops(airdropsRes.data);
        setTasks(tasksRes.data);
      } catch (err) {
        console.error("Failed to fetch intern data", err);
      }
    };
    fetchData();
  }, []);
"""

text = re.sub(r'  useEffect\(\(\) => \{\n    const storedAirdrops.*?\n  \}, \[\]\);', replacement, text, flags=re.DOTALL)

with open("frontend/src/pages/Dashboard/InternDashboard.jsx", "w", encoding="utf-8") as f:
    f.write(text)
