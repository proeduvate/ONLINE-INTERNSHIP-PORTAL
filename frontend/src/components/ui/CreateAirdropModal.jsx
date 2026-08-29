import React, { useState, useEffect } from 'react';
import { X, Trophy, MessageSquare, Clock, Gift } from 'lucide-react';
import './CreateAirdropModal.css';

export default function CreateAirdropModal({ onClose, onSave }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    task_type: "mcq",
    task_config: { question: "", options: ["", "", "", ""], correct_answer: "" },
    start_mode: "fixed",
    time_limit: 60,
    start_time: "",
    points_distribution: "100",
    winner_count: 3
  });

  const [dateInput, setDateInput] = useState("");
  const [startHour, setStartHour] = useState("12");
  const [startMin, setStartMin] = useState("00");
  const [startAmPm, setStartAmPm] = useState("AM");
  
  const [endDateInput, setEndDateInput] = useState("");
  const [endHour, setEndHour] = useState("12");
  const [endMin, setEndMin] = useState("00");
  const [endAmPm, setEndAmPm] = useState("AM");

  const [pointsArray, setPointsArray] = useState([100, 50, 25]);

  const handlePointsChange = (index, val) => {
    // only allow numeric input
    if (val !== "" && !/^\d+$/.test(val)) return;
    const newArr = [...pointsArray];
    newArr[index] = val === "" ? "" : parseInt(val, 10);
    setPointsArray(newArr);
  };

  const handleWinnerCountChange = (val) => {
    if (val !== "" && !/^\d+$/.test(val)) return;
    const newCount = val === "" ? "" : parseInt(val, 10);
    setFormData({...formData, winner_count: newCount});
    
    if (typeof newCount === 'number' && newCount > 0) {
      if (newCount > pointsArray.length) {
        const added = Array(newCount - pointsArray.length).fill(10);
        setPointsArray([...pointsArray, ...added]);
      } else if (newCount < pointsArray.length) {
        setPointsArray(pointsArray.slice(0, newCount));
      }
    }
  };

  useEffect(() => {
    if (formData.start_mode === 'fixed') {
      const get24HourTime = (hStr, mStr, ampmStr) => {
        let h = parseInt(hStr, 10);
        if (ampmStr === "PM" && h !== 12) h += 12;
        if (ampmStr === "AM" && h === 12) h = 0;
        return `${h.toString().padStart(2, '0')}:${mStr.padStart(2, '0')}`;
      };

      if (dateInput && startHour && startMin) {
        const timeString = get24HourTime(startHour, startMin, startAmPm);
        const isoString = new Date(`${dateInput}T${timeString}`).toISOString();
        setFormData(prev => ({ ...prev, start_time: isoString }));
      }
      if (dateInput && startHour && startMin && endDateInput && endHour && endMin) {
        const startString = get24HourTime(startHour, startMin, startAmPm);
        const endString = get24HourTime(endHour, endMin, endAmPm);
        const start = new Date(`${dateInput}T${startString}`);
        const end = new Date(`${endDateInput}T${endString}`);
        const diffSeconds = Math.max(0, Math.floor((end - start) / 1000));
        setFormData(prev => ({ ...prev, time_limit: diffSeconds }));
      }
    }
  }, [dateInput, startHour, startMin, startAmPm, endDateInput, endHour, endMin, endAmPm, formData.start_mode]);

  const handleTaskTypeChange = (type) => {
    let config = {};
    if (type === "mcq") config = { question: "", options: ["", "", "", ""], correct_answer: "" };
    if (type === "pattern") config = { question: "", correct_answer: "" };
    if (type === "true_false") config = { statement: "", correct_answer: true };
    if (type === "fill_blank") config = { question: "", correct_answer: "" };
    if (type === "match") config = { pairs: { "Key 1": "Value 1" } };
    if (type === "arrange") config = { items: ["Item 1", "Item 2"], correct_order: ["Item 1", "Item 2"] };
    if (type === "code_output_mcq") config = { language: "python", code: "", options: ["", "", "", ""], correct_answer: "" };
    
    setFormData({ ...formData, task_type: type, task_config: config });
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.task_config.options];
    newOptions[index] = value;
    setFormData({ ...formData, task_config: { ...formData.task_config, options: newOptions } });
  };

  const handleMatchChange = (index, field, value) => {
    const pairs = { ...formData.task_config.pairs };
    const keys = Object.keys(pairs);
    const currentKey = keys[index];
    const currentValue = pairs[currentKey];
    
    if (field === 'key') {
      const newPairs = {};
      keys.forEach(k => {
        if (k === currentKey) {
          newPairs[value] = currentValue;
        } else {
          newPairs[k] = pairs[k];
        }
      });
      setFormData({ ...formData, task_config: { ...formData.task_config, pairs: newPairs } });
    } else {
      pairs[currentKey] = value;
      setFormData({ ...formData, task_config: { ...formData.task_config, pairs } });
    }
  };

  const addMatchPair = () => {
    const pairs = { ...formData.task_config.pairs };
    pairs[`Key ${Object.keys(pairs).length + 1}`] = `Value ${Object.keys(pairs).length + 1}`;
    setFormData({ ...formData, task_config: { ...formData.task_config, pairs } });
  };

  const handleArrangeChange = (index, value) => {
    const newItems = [...formData.task_config.items];
    newItems[index] = value;
    setFormData({ ...formData, task_config: { ...formData.task_config, items: newItems, correct_order: newItems } });
  };

  const addArrangeItem = () => {
    const newItems = [...formData.task_config.items, `Item ${formData.task_config.items.length + 1}`];
    setFormData({ ...formData, task_config: { ...formData.task_config, items: newItems, correct_order: newItems } });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Ensure numeric fields are valid
    const finalWinnerCount = parseInt(formData.winner_count, 10) || 1;
    const cleanPointsArray = pointsArray.map(p => p === "" ? 0 : parseInt(p, 10));
    
    const finalData = { 
      ...formData, 
      winner_count: finalWinnerCount,
      points_distribution: cleanPointsArray.join(","),
      start_time: formData.start_time || null,
      bonus_points: 100
    };
    onSave(finalData);
  };

  return (
    <div className="airdrop-modal-overlay">
      <div className="airdrop-modal-content">
        
        <div className="airdrop-modal-header">
          <div className="header-title-container">
            <div className="icon-circle">
              <Trophy size={20} color="#6366f1" />
            </div>
            <div>
              <h2>Create New Bonus Airdrop</h2>
              <p>Create a time-bound bonus challenge for interns.</p>
            </div>
          </div>
          <button className="close-button" onClick={onClose} type="button">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="airdrop-form-body">
          <div className="form-row two-cols">
            <div className="form-group">
              <label>Title <span className="required">*</span></label>
              <input 
                type="text" 
                placeholder="Enter airdrop title" 
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
              />
              <span className="char-count">{formData.title.length}/100</span>
            </div>
            <div className="form-group">
              <label>Task Type <span className="required">*</span></label>
              <select 
                value={formData.task_type}
                onChange={(e) => handleTaskTypeChange(e.target.value)}
              >
                <option value="mcq">Multiple Choice</option>
                <option value="pattern">Pattern / Sequence</option>
                <option value="true_false">True / False</option>
                <option value="fill_blank">Fill in the Blank</option>
                <option value="match">Match the Following</option>
                <option value="arrange">Arrange in Order</option>
                <option value="code_output_mcq">Code Output MCQ</option>
              </select>
            </div>
          </div>

          <div className="form-section">
            <div className="section-header">
              <MessageSquare size={16} color="#6366f1" />
              <h3>Task Details ({formData.task_type.replace(/_/g, ' ').toUpperCase()})</h3>
            </div>
            
            {/* MCQ & Code Output MCQ */}
            {(formData.task_type === 'mcq' || formData.task_type === 'code_output_mcq') && (
              <div className="form-row two-cols mcq-details">
                <div className="form-group">
                  {formData.task_type === 'code_output_mcq' && (
                    <>
                      <label>Language <span className="required">*</span></label>
                      <select 
                        value={formData.task_config.language || 'python'}
                        onChange={(e) => setFormData({...formData, task_config: {...formData.task_config, language: e.target.value}})}
                        className="mb-3"
                      >
                        <option value="python">Python</option>
                        <option value="javascript">JavaScript</option>
                        <option value="c">C</option>
                      </select>
                      <label>Code Snippet <span className="required">*</span></label>
                      <textarea 
                        placeholder="print('Hello World')"
                        rows={5}
                        required
                        style={{fontFamily: 'monospace'}}
                        value={formData.task_config.code || ''}
                        onChange={(e) => setFormData({...formData, task_config: {...formData.task_config, code: e.target.value}})}
                        className="mb-3"
                      />
                    </>
                  )}
                  {formData.task_type === 'mcq' && (
                    <>
                      <label>Question <span className="required">*</span></label>
                      <textarea 
                        placeholder="Enter your question here..."
                        rows={6}
                        required
                        value={formData.task_config.question}
                        onChange={(e) => setFormData({...formData, task_config: {...formData.task_config, question: e.target.value}})}
                      />
                      <span className="char-count">{formData.task_config.question.length}/500</span>
                    </>
                  )}
                  
                  <div className="form-group" style={{marginTop: '20px'}}>
                    <label>Correct Answer <span className="required">*</span></label>
                    <select
                      required
                      value={formData.task_config.correct_answer}
                      onChange={(e) => setFormData({...formData, task_config: {...formData.task_config, correct_answer: e.target.value}})}
                    >
                      <option value="">Select the correct option</option>
                      {formData.task_config.options.map((opt, i) => (
                        <option key={i} value={opt} disabled={!opt}>{opt || `Option ${String.fromCharCode(65+i)}`}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="form-group options-group">
                  <label>Options <span className="required">*</span></label>
                  {formData.task_config.options.map((opt, i) => (
                    <div className="option-input-wrapper" key={i}>
                      <input 
                        type="radio" 
                        name="correct_option" 
                        checked={formData.task_config.correct_answer === opt && opt !== ""}
                        onChange={() => setFormData({...formData, task_config: {...formData.task_config, correct_answer: opt}})}
                        disabled={!opt}
                      />
                      <span className="option-label">{String.fromCharCode(65 + i)}</span>
                      <input 
                        type="text" 
                        placeholder={`Option ${String.fromCharCode(65 + i)}`}
                        value={opt}
                        onChange={(e) => handleOptionChange(i, e.target.value)}
                        required
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pattern & Fill Blank */}
            {(formData.task_type === 'pattern' || formData.task_type === 'fill_blank') && (
              <div className="form-row two-cols">
                <div className="form-group">
                  <label>{formData.task_type === 'pattern' ? 'Pattern Series' : 'Sentence with Blank'} <span className="required">*</span></label>
                  <textarea 
                    placeholder={formData.task_type === 'pattern' ? "e.g. 2, 4, 6, ?" : "The quick brown ___ jumps over the lazy dog."}
                    rows={3}
                    required
                    value={formData.task_config.question}
                    onChange={(e) => setFormData({...formData, task_config: {...formData.task_config, question: e.target.value}})}
                  />
                </div>
                <div className="form-group">
                  <label>Correct Answer <span className="required">*</span></label>
                  <input 
                    type="text" 
                    placeholder="Exact string match"
                    required
                    value={formData.task_config.correct_answer}
                    onChange={(e) => setFormData({...formData, task_config: {...formData.task_config, correct_answer: e.target.value}})}
                  />
                </div>
              </div>
            )}

            {/* True / False */}
            {formData.task_type === 'true_false' && (
              <div className="form-row two-cols">
                <div className="form-group">
                  <label>Statement <span className="required">*</span></label>
                  <textarea 
                    placeholder="Enter true/false statement"
                    rows={3}
                    required
                    value={formData.task_config.statement}
                    onChange={(e) => setFormData({...formData, task_config: {...formData.task_config, statement: e.target.value}})}
                  />
                </div>
                <div className="form-group">
                  <label>Correct Answer <span className="required">*</span></label>
                  <select 
                    value={formData.task_config.correct_answer}
                    onChange={(e) => setFormData({...formData, task_config: {...formData.task_config, correct_answer: e.target.value === 'true'}})}
                  >
                    <option value="true">True</option>
                    <option value="false">False</option>
                  </select>
                </div>
              </div>
            )}

            {/* Match */}
            {formData.task_type === 'match' && (
              <div className="form-row">
                <div className="form-group">
                  <label>Pairs <span className="required">*</span></label>
                  {Object.entries(formData.task_config.pairs).map(([k, v], i) => (
                    <div className="option-input-wrapper mb-2" key={i}>
                      <input 
                        type="text" 
                        value={k}
                        onChange={(e) => handleMatchChange(i, 'key', e.target.value)}
                        placeholder="Left Side"
                        required
                      />
                      <span>➔</span>
                      <input 
                        type="text" 
                        value={v}
                        onChange={(e) => handleMatchChange(i, 'value', e.target.value)}
                        placeholder="Right Side"
                        required
                      />
                    </div>
                  ))}
                  <button type="button" onClick={addMatchPair} style={{alignSelf: 'flex-start', padding: '6px 12px', marginTop: '10px', background: '#eef2ff', color: '#6366f1', border: 'none', borderRadius: '4px', cursor: 'pointer'}}>+ Add Pair</button>
                </div>
              </div>
            )}

            {/* Arrange */}
            {formData.task_type === 'arrange' && (
              <div className="form-row">
                <div className="form-group">
                  <label>Items in Correct Order <span className="required">*</span></label>
                  {formData.task_config.items.map((item, i) => (
                    <div className="option-input-wrapper mb-2" key={i}>
                      <span style={{fontWeight: 'bold', color: '#94a3b8'}}>{i + 1}.</span>
                      <input 
                        type="text" 
                        value={item}
                        onChange={(e) => handleArrangeChange(i, e.target.value)}
                        required
                      />
                    </div>
                  ))}
                  <button type="button" onClick={addArrangeItem} style={{alignSelf: 'flex-start', padding: '6px 12px', marginTop: '10px', background: '#eef2ff', color: '#6366f1', border: 'none', borderRadius: '4px', cursor: 'pointer'}}>+ Add Item</button>
                </div>
              </div>
            )}
          </div>

          <div className="form-section">
            <div className="section-header">
              <Clock size={16} color="#6366f1" />
              <h3>Timing & Start Mode</h3>
            </div>
            
            <div className="form-row two-cols timing-row">
              <div className="form-group start-mode-group">
                <label>Start Mode <span className="required">*</span></label>
                <div className="mode-cards">
                  <div 
                    className={`mode-card ${formData.start_mode === 'fixed' ? 'active' : ''}`}
                    onClick={() => setFormData({...formData, start_mode: 'fixed'})}
                  >
                    <div className="radio-circle"></div>
                    <div>
                      <h4>Fixed Start Time</h4>
                      <p>All eligible interns start at the same time</p>
                    </div>
                  </div>
                  <div 
                    className={`mode-card ${formData.start_mode === 'flexible' ? 'active' : ''}`}
                    onClick={() => setFormData({...formData, start_mode: 'flexible'})}
                  >
                    <div className="radio-circle"></div>
                    <div>
                      <h4>Flexible Start</h4>
                      <p>Interns can start anytime in the window</p>
                    </div>
                  </div>
                </div>

                {formData.start_mode === 'fixed' && (
                  <>
                    <div className="form-row two-cols mt-4">
                      <div className="form-group">
                        <label>Start Date <span className="required">*</span></label>
                        <input 
                          type="date" 
                          required 
                          value={dateInput}
                          onChange={(e) => setDateInput(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Start Time <span className="required">*</span></label>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <select value={startHour} onChange={(e) => setStartHour(e.target.value)} style={{ flex: 1, padding: '8px' }}>
                            {Array.from({ length: 12 }, (_, i) => {
                              const h = (i === 0 ? 12 : i).toString().padStart(2, '0');
                              return <option key={h} value={h}>{h}</option>;
                            })}
                          </select>
                          <span style={{ display: 'flex', alignItems: 'center' }}>:</span>
                          <select value={startMin} onChange={(e) => setStartMin(e.target.value)} style={{ flex: 1, padding: '8px' }}>
                            {Array.from({ length: 60 }, (_, i) => {
                              const m = i.toString().padStart(2, '0');
                              return <option key={m} value={m}>{m}</option>;
                            })}
                          </select>
                          <select value={startAmPm} onChange={(e) => setStartAmPm(e.target.value)} style={{ flex: 1, padding: '8px' }}>
                            <option value="AM">AM</option>
                            <option value="PM">PM</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    <div className="form-row two-cols mt-3">
                      <div className="form-group">
                        <label>End Date <span className="required">*</span></label>
                        <input 
                          type="date" 
                          required 
                          value={endDateInput}
                          onChange={(e) => setEndDateInput(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>End Time <span className="required">*</span></label>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <select value={endHour} onChange={(e) => setEndHour(e.target.value)} style={{ flex: 1, padding: '8px' }}>
                            {Array.from({ length: 12 }, (_, i) => {
                              const h = (i === 0 ? 12 : i).toString().padStart(2, '0');
                              return <option key={h} value={h}>{h}</option>;
                            })}
                          </select>
                          <span style={{ display: 'flex', alignItems: 'center' }}>:</span>
                          <select value={endMin} onChange={(e) => setEndMin(e.target.value)} style={{ flex: 1, padding: '8px' }}>
                            {Array.from({ length: 60 }, (_, i) => {
                              const m = i.toString().padStart(2, '0');
                              return <option key={m} value={m}>{m}</option>;
                            })}
                          </select>
                          <select value={endAmPm} onChange={(e) => setEndAmPm(e.target.value)} style={{ flex: 1, padding: '8px' }}>
                            <option value="AM">AM</option>
                            <option value="PM">PM</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
              
              {formData.start_mode === 'flexible' && (
                <div className="form-group">
                  <label>Time Limit (Seconds) <span className="required">*</span></label>
                  <input 
                    type="number" 
                    value={formData.time_limit}
                    onChange={(e) => setFormData({...formData, time_limit: parseInt(e.target.value)})}
                    required
                  />
                  <span className="help-text">Time allowed to complete the task</span>
                </div>
              )}
            </div>
          </div>

          <div className="form-section">
            <div className="section-header">
              <Gift size={16} color="#6366f1" />
              <h3>Winners & Rewards</h3>
            </div>
            
            <div className="form-row two-cols">
              <div className="form-group">
                <label>Total Winners <span className="required">*</span></label>
                <div className="input-with-icon" style={{ paddingLeft: 0 }}>
                  <input 
                    type="text" 
                    inputMode="numeric"
                    value={formData.winner_count}
                    onChange={(e) => handleWinnerCountChange(e.target.value)}
                    required
                    style={{ paddingLeft: "16px" }}
                  />
                </div>
                <span className="help-text">Exact number of winners to be selected</span>
              </div>
              
              <div className="form-group">
                <label>Points Per Rank <span className="required">*</span></label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '150px', overflowY: 'auto', padding: '4px' }}>
                  {pointsArray.map((pts, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#475569', minWidth: '55px' }}>Rank {i + 1}</span>
                      <input 
                        type="text" 
                        inputMode="numeric"
                        value={pts}
                        onChange={(e) => handlePointsChange(i, e.target.value)}
                        required
                        style={{ padding: '8px 12px', flex: 1 }}
                      />
                    </div>
                  ))}
                </div>
                <span className="help-text">Points awarded to each rank</span>
              </div>
            </div>
          </div>

          <div className="modal-footer-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-save">
              <Gift size={16} /> Create Airdrop
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
