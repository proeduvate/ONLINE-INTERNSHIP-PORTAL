import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Folder, File, FilePlus, FolderPlus, X, ChevronRight, ChevronDown, Save, Edit2, Trash2 } from 'lucide-react';
import './WebIDE.css';

const WebIDE = ({ initialFiles, language = 'javascript', onChange }) => {
  const [isDark, setIsDark] = useState(() => document.documentElement.getAttribute('data-theme') === 'dark');
  const [files, setFiles] = useState(
    initialFiles || [
      { path: 'src/index.js', content: '// Write your code here\n', isFolder: false },
      { path: 'src', content: '', isFolder: true },
    ]
  );
  const [activeFilePath, setActiveFilePath] = useState('src/index.js');
  const [openTabs, setOpenTabs] = useState(['src/index.js']);
  const [expandedFolders, setExpandedFolders] = useState(['src']);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);
  const [renamingPath, setRenamingPath] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const [creatingItem, setCreatingItem] = useState(null);
  const [createValue, setCreateValue] = useState("");

  // Observe dark/light theme changes on :root
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.getAttribute('data-theme') === 'dark');
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  // Global click listener to close context menu
  React.useEffect(() => {
    const handleClick = () => setContextMenu(null);
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  // Keyboard shortcut for saving
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [files]);

  const handleCreateFile = (targetFolder = selectedFolder) => {
    setCreatingItem({ parentPath: targetFolder, isFolder: false });
    setCreateValue("");
  };

  const handleCreateFolder = (targetFolder = selectedFolder) => {
    setCreatingItem({ parentPath: targetFolder, isFolder: true });
    setCreateValue("");
  };

  const handleCreateSubmit = () => {
    if (!createValue.trim()) {
      setCreatingItem(null);
      return;
    }
    const fullPath = creatingItem.parentPath ? `${creatingItem.parentPath}/${createValue}` : createValue;
    if (files.find(f => f.path === fullPath)) {
      alert("A file or folder with this name already exists.");
      return;
    }
    const newFiles = [...files, { path: fullPath, content: '', isFolder: creatingItem.isFolder }];
    setFiles(newFiles);
    
    if (creatingItem.parentPath && !expandedFolders.includes(creatingItem.parentPath)) {
      setExpandedFolders([...expandedFolders, creatingItem.parentPath]);
    }
    if (!creatingItem.isFolder) {
      handleFileClick(fullPath);
    }
    setCreatingItem(null);
    notifyChange(newFiles);
  };

  const handleSave = () => {
    setIsSaving(true);
    // Simulate save delay
    setTimeout(() => {
      setIsSaving(false);
      // Optional: trigger notifyChange here if you only want to save on explicit save
      notifyChange(files); 
    }, 500);
  };

  const handleContextMenu = (e, file) => {
    e.preventDefault();
    setContextMenu({
      mouseX: e.clientX - 2,
      mouseY: e.clientY - 4,
      file
    });
  };

  const handleDelete = (path) => {
    if (window.confirm(`Are you sure you want to delete ${path}?`)) {
      const newFiles = files.filter(f => !f.path.startsWith(path));
      setFiles(newFiles);
      setOpenTabs(openTabs.filter(t => !t.startsWith(path)));
      if (activeFilePath?.startsWith(path)) setActiveFilePath(null);
      notifyChange(newFiles);
    }
  };

  const initiateRename = (file) => {
    setRenamingPath(file.path);
    setRenameValue(file.path.split('/').pop());
  };

  const handleRenameSubmit = (oldPath) => {
    if (!renameValue.trim()) return;
    const parts = oldPath.split('/');
    parts.pop();
    const newPath = parts.length > 0 ? `${parts.join('/')}/${renameValue}` : renameValue;
    
    if (oldPath === newPath) {
      setRenamingPath(null);
      return;
    }

    if (files.find(f => f.path === newPath)) {
      alert("A file or folder with this name already exists.");
      return;
    }

    const newFiles = files.map(f => {
      if (f.path.startsWith(oldPath)) {
        return { ...f, path: f.path.replace(oldPath, newPath) };
      }
      return f;
    });

    setFiles(newFiles);
    setOpenTabs(openTabs.map(t => t.startsWith(oldPath) ? t.replace(oldPath, newPath) : t));
    if (activeFilePath?.startsWith(oldPath)) setActiveFilePath(activeFilePath.replace(oldPath, newPath));
    setRenamingPath(null);
    notifyChange(newFiles);
  };

  const handleFileClick = (path) => {
    if (!openTabs.includes(path)) {
      setOpenTabs([...openTabs, path]);
    }
    setActiveFilePath(path);
    // Determine the folder of the clicked file
    const parts = path.split('/');
    if (parts.length > 1) {
      parts.pop(); // remove file name
      setSelectedFolder(parts.join('/'));
    } else {
      setSelectedFolder(null);
    }
  };

  const handleFolderClick = (path) => {
    setSelectedFolder(path);
    if (expandedFolders.includes(path)) {
      setExpandedFolders(expandedFolders.filter(p => p !== path));
    } else {
      setExpandedFolders([...expandedFolders, path]);
    }
  };

  const closeTab = (e, path) => {
    e.stopPropagation();
    const newTabs = openTabs.filter(t => t !== path);
    setOpenTabs(newTabs);
    if (activeFilePath === path) {
      setActiveFilePath(newTabs.length > 0 ? newTabs[newTabs.length - 1] : null);
    }
  };

  const handleEditorChange = (value) => {
    if (!activeFilePath) return;
    const newFiles = files.map(f => {
      if (f.path === activeFilePath) {
        return { ...f, content: value };
      }
      return f;
    });
    setFiles(newFiles);
    notifyChange(newFiles);
  };

  const notifyChange = (newFiles) => {
    if (onChange) {
      onChange(newFiles);
    }
  };

  const activeFile = files.find(f => f.path === activeFilePath);

  // Simple sorting: folders first, then files
  const sortedFiles = [...files].sort((a, b) => {
    if (a.isFolder === b.isFolder) {
      return a.path.localeCompare(b.path);
    }
    return a.isFolder ? -1 : 1;
  });

  let displayFiles = [...sortedFiles];
  if (creatingItem) {
    const tempPath = creatingItem.parentPath ? `${creatingItem.parentPath}/__temp_creating__` : '__temp_creating__';
    displayFiles.push({ path: tempPath, isFolder: creatingItem.isFolder, isTemp: true });
    displayFiles.sort((a, b) => {
      if (a.isFolder === b.isFolder) {
        return a.path.localeCompare(b.path);
      }
      return a.isFolder ? -1 : 1;
    });
  }

  return (
    <div className="web-ide-container">
      {/* Sidebar */}
      <div className="web-ide-sidebar">
        <div className="web-ide-sidebar-header">
          <span>EXPLORER</span>
          <div className="web-ide-sidebar-actions">
            <button onClick={() => handleSave()} title="Save (Ctrl+S)" style={{ color: isSaving ? '#10b981' : undefined }}>
              <Save size={16} />
            </button>
            <button onClick={() => handleCreateFile(selectedFolder)} title="New File">
              <FilePlus size={16} />
            </button>
            <button onClick={() => handleCreateFolder(selectedFolder)} title="New Folder">
              <FolderPlus size={16} />
            </button>
          </div>
        </div>
        <div className="web-ide-file-tree">
          {displayFiles.map(file => (
            <div
              key={file.path}
              className={`web-ide-tree-item ${(!file.isFolder && activeFilePath === file.path) || (file.isFolder && selectedFolder === file.path) ? 'active' : ''}`}
              onClick={() => {
                if (file.isTemp) return;
                file.isFolder ? handleFolderClick(file.path) : handleFileClick(file.path);
              }}
              onContextMenu={(e) => {
                if (file.isTemp) return;
                handleContextMenu(e, file);
              }}
              style={{ paddingLeft: file.path.includes('/') ? `${(file.path.split('/').length - 1) * 12 + 12}px` : '12px' }}
            >
              {file.isTemp ? (
                <>
                  <div className="web-ide-tree-icon">
                    {file.isFolder ? <ChevronRight size={14} /> : <File size={14} />}
                  </div>
                  {file.isFolder ? <Folder size={14} style={{ marginRight: '8px', color: '#64748b' }} /> : null}
                  <input
                    type="text"
                    value={createValue}
                    onChange={(e) => setCreateValue(e.target.value)}
                    onBlur={handleCreateSubmit}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCreateSubmit();
                      if (e.key === 'Escape') setCreatingItem(null);
                    }}
                    autoFocus
                    className="web-ide-rename-input"
                    onClick={(e) => e.stopPropagation()}
                    placeholder={file.isFolder ? "Folder name..." : "File name..."}
                  />
                </>
              ) : (
                <>
                  <div className="web-ide-tree-icon">
                    {file.isFolder ? (
                      expandedFolders.includes(file.path) ? <ChevronDown size={14} /> : <ChevronRight size={14} />
                    ) : (
                      <File size={14} />
                    )}
                  </div>
                  {file.isFolder ? <Folder size={14} style={{ marginRight: '8px', color: '#64748b' }} /> : null}
                  
                  {renamingPath === file.path ? (
                    <input
                      type="text"
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onBlur={() => handleRenameSubmit(file.path)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleRenameSubmit(file.path);
                        if (e.key === 'Escape') setRenamingPath(null);
                      }}
                      autoFocus
                      className="web-ide-rename-input"
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <span>{file.path.split('/').pop()}</span>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div 
          className="web-ide-context-menu"
          style={{ top: contextMenu.mouseY, left: contextMenu.mouseX }}
        >
          {contextMenu.file.isFolder && (
            <>
              <div className="web-ide-context-item" onClick={() => handleCreateFile(contextMenu.file.path)}>
                <FilePlus size={14} /> New File
              </div>
              <div className="web-ide-context-item" onClick={() => handleCreateFolder(contextMenu.file.path)}>
                <FolderPlus size={14} /> New Folder
              </div>
            </>
          )}
          <div className="web-ide-context-item" onClick={() => initiateRename(contextMenu.file)}>
            <Edit2 size={14} /> Rename
          </div>
          <div className="web-ide-context-item danger" onClick={() => handleDelete(contextMenu.file.path)}>
            <Trash2 size={14} /> Delete
          </div>
        </div>
      )}

      {/* Main Area */}
      <div className="web-ide-main">
        {/* Tabs */}
        {openTabs.length > 0 && (
          <div className="web-ide-tabs">
            {openTabs.map(tabPath => (
              <div
                key={tabPath}
                className={`web-ide-tab ${activeFilePath === tabPath ? 'active' : ''}`}
                onClick={() => handleFileClick(tabPath)}
              >
                {tabPath.split('/').pop()}
                <button className="web-ide-tab-close" onClick={(e) => closeTab(e, tabPath)}>
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Editor */}
        <div className="web-ide-editor-area">
          {activeFile ? (
            <Editor
              height="100%"
              language={language}
              theme={isDark ? "vs-dark" : "vs-light"}
              value={activeFile.content}
              onChange={handleEditorChange}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                wordWrap: 'on',
                scrollBeyondLastLine: false,
              }}
            />
          ) : (
            <div className="web-ide-empty">
              Select a file from the explorer or create a new one to start coding.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WebIDE;
