// C:\Users\jov\Documents\proyectos\seleniun\document-intellisense\src\lib\markdown-to-html.ts

export function markdownToHtml(markdown: string): string {
  if (!markdown) return '';
  
  // PASO 1: Convertir títulos línea por línea
  const lines = markdown.split('\n');
  const processed: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    // Detectar títulos
    if (trimmed.startsWith('### ')) {
      processed.push('<h3>' + trimmed.substring(4) + '</h3>');
    }
    else if (trimmed.startsWith('## ')) {
      processed.push('<h2>' + trimmed.substring(3) + '</h2>');
    }
    else if (trimmed.startsWith('# ')) {
      processed.push('<h1>' + trimmed.substring(2) + '</h1>');
    }
    else if (trimmed) {
      processed.push(line);
    }
    else {
      processed.push('');
    }
  }
  
  let html = processed.join('\n');
  
  // PASO 2: Negritas y cursivas
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  
  // PASO 3: Procesar listas y párrafos
  const htmlLines = html.split('\n');
  const result: string[] = [];
  let inList = false;
  let listType = '';
  
  for (const line of htmlLines) {
    const trimmed = line.trim();
    
    if (trimmed.startsWith('- ')) {
      if (!inList || listType !== 'ul') {
        if (inList) result.push(`</${listType}>`);
        result.push('<ul>');
        inList = true;
        listType = 'ul';
      }
      result.push(`<li>${trimmed.substring(2)}</li>`);
    }
    else if (/^\d+\.\s/.test(trimmed)) {
      if (!inList || listType !== 'ol') {
        if (inList) result.push(`</${listType}>`);
        result.push('<ol>');
        inList = true;
        listType = 'ol';
      }
      result.push(`<li>${trimmed.replace(/^\d+\.\s/, '')}</li>`);
    }
    else {
      if (inList) {
        result.push(`</${listType}>`);
        inList = false;
        listType = '';
      }
      
      if (trimmed.startsWith('<h') || trimmed === '') {
        result.push(trimmed);
      }
      else if (trimmed.length > 0) {
        result.push(`<p>${trimmed}</p>`);
      }
    }
  }
  
  if (inList) {
    result.push(`</${listType}>`);
  }
  
  return result.join('\n');
}