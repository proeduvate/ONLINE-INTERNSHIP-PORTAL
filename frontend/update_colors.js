const fs = require('fs');

const cssPath = 'src/features/learning/interactive/styles.css';
let css = fs.readFileSync(cssPath, 'utf8');

const mapping = {
  // Backgrounds -> var(--bg-surface), var(--card-bg)
  '#080b09': 'var(--bg-surface)',
  '#0a0d0b': 'var(--bg-surface)',
  '#070907': 'var(--bg-surface)',
  '#0c100d': 'var(--card-bg)',
  '#0a1008': 'var(--bg-surface)',
  '#070a08': 'var(--card-bg)',
  '#080c09': 'var(--bg-surface-elevated)',
  '#121812': 'var(--card-bg)',
  '#121712': 'var(--bg-surface-elevated)',
  '#111611': 'var(--card-bg)',
  '#111911': 'var(--bg-surface)',
  '#141b15': 'var(--card-bg)',
  '#152016': 'var(--bg-surface-elevated)',
  '#1a231b': 'var(--bg-surface-elevated)',
  '#101610': 'var(--card-bg)',
  '#0b100d': 'var(--bg-surface)',
  '#0a0e0b': 'var(--bg-surface)',
  '#0e130f': 'var(--card-bg)',
  '#0f150f': 'var(--bg-surface-elevated)',
  '#172117': 'var(--card-bg)',
  '#172018': 'var(--card-bg)',
  '#182314': 'var(--bg-surface-elevated)',
  '#132012': 'var(--card-bg)',
  '#172216': 'var(--bg-surface-elevated)',
  '#0e140f': 'var(--card-bg)',
  '#141c15': 'var(--bg-surface-elevated)',
  '#162018': 'var(--card-bg)',
  '#182019': 'var(--bg-surface)',

  // Texts -> var(--text-color)
  '#ecf7ed': 'var(--text-color)',
  '#efffe7': 'var(--text-color)',
  '#d1dbd0': 'var(--text-color)',
  '#c8ffab': 'var(--text-color)',
  '#d7e1d7': 'var(--text-color)',
  '#f0f5ee': 'var(--text-color)',
  '#cfffba': 'var(--text-color)',
  '#cfe0cf': 'var(--text-color)',
  '#e4eee4': 'var(--text-color)',
  '#c8fbb8': 'var(--text-color)',
  '#f1f5ef': 'var(--text-color)',
  '#c9d8c9': 'var(--text-color)',
  '#cfe0ca': 'var(--text-color)',

  // Muted texts -> var(--text-tertiary)
  '#829080': 'var(--text-tertiary)',
  '#aab6aa': 'var(--text-tertiary)',
  '#6f7e70': 'var(--text-tertiary)',
  '#7c887e': 'var(--text-tertiary)',
  '#a7b4a7': 'var(--text-tertiary)',
  '#aebcaf': 'var(--text-tertiary)',
  '#a7b2a8': 'var(--text-tertiary)',
  '#6f7c71': 'var(--text-tertiary)',
  '#b5c2b5': 'var(--text-tertiary)',
  '#9cab9d': 'var(--text-tertiary)',
  '#758275': 'var(--text-tertiary)',
  '#cbd6cb': 'var(--text-tertiary)',
  '#91a090': 'var(--text-tertiary)',
  '#aebaaf': 'var(--text-tertiary)',
  '#dce6da': 'var(--text-tertiary)',
  '#849185': 'var(--text-tertiary)',
  '#aebaae': 'var(--text-tertiary)',
  '#8b988d': 'var(--text-tertiary)',
  '#7f8d80': 'var(--text-tertiary)',
  '#7b877c': 'var(--text-tertiary)',

  // Borders -> var(--border-color)
  '#18321d': 'var(--border-color)',
  '#202920': 'var(--border-color)',
  '#35522e': 'var(--border-color-hover)',
  '#253025': 'var(--border-color)',
  '#35552d': 'var(--border-color-hover)',
  '#33452f': 'var(--border-color)',
  '#1d271e': 'var(--border-color)',
  '#1c281d': 'var(--border-color)',
  '#2a382b': 'var(--border-color)',
  '#638d52': 'var(--border-color-hover)',
  '#273329': 'var(--border-color)',
  '#36582e': 'var(--border-color-hover)',
  '#334133': 'var(--border-color)',
  '#557c42': 'var(--border-color-hover)',
  '#202b21': 'var(--border-color)',
  '#2b3a2c': 'var(--border-color)',
  '#2a362b': 'var(--border-color)',
  '#314032': 'var(--border-color)',
  '#38522f': 'var(--border-color-hover)',
  '#243024': 'var(--border-color)',
  '#38502f': 'var(--border-color-hover)',
  '#334333': 'var(--border-color)',
  '#526652': 'var(--border-color-hover)',
  '#2b392c': 'var(--border-color)',
  '#344834': 'var(--border-color)',
  '#34572a': 'var(--border-color-hover)',

  // Accents -> var(--primary-color)
  '#b8ff39': 'var(--primary-color)',
  '#73bd56': 'var(--success-color)',
  
  // Danger/Warning
  '#ff7e7e': 'var(--error-color)',
  '#e66b6b': 'var(--error-color)',
  '#d6c26a': 'var(--warning-color)',

  // Others / rgba approximations
  '#0005': 'rgba(0, 0, 0, 0.05)',
};

// Also replace linear/radial gradients involving hardcoded colors
css = css.replace(/radial-gradient\([^)]+\)/g, 'var(--bg-page)');
css = css.replace(/linear-gradient\([^)]+\)/g, 'var(--bg-surface-elevated)');

// Replace exact matches of hex colors
const hexRegex = /#[0-9a-fA-F]{3,6}/g;
css = css.replace(hexRegex, (match) => {
  const lowerMatch = match.toLowerCase();
  return mapping[lowerMatch] || match;
});

fs.writeFileSync(cssPath, css);
console.log('CSS updated successfully!');
