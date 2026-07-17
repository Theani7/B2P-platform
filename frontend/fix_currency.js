const fs = require('fs');

const files = [
  'app/(app)/messages/page.tsx',
  'app/(app)/business/collaborations/page.tsx',
  'app/(app)/business/invitations/page.tsx',
  'app/(app)/admin/campaigns/page.tsx',
  'app/(app)/promoter/collaborations/page.tsx',
  'app/(app)/promoter/marketplace/page.tsx',
  'app/(app)/promoter/applications/page.tsx',
  'app/(app)/promoter/invitations/page.tsx',
  'components/campaigns/StatusBadge.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // messages/page.tsx
  content = content.replace(/function formatBudget\(n\?: number \| null\) \{\s*if \(\!n\) return "0";\s*return `\$\$\{n\.toLocaleString\(\)\}`;\s*\}/, 
    'function formatBudget(n?: number | null) {\n  return "Rs. " + new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n ?? 0);\n}');
  content = content.replace(/\$\{formatBudget\(/g, '{formatBudget(');

  // business/collaborations/page.tsx
  content = content.replace(/const formatBudget = \(n: number\) => `\$\$\{n\.toLocaleString\(\)\}`;/, 
    'const formatBudget = (n: number) => "Rs. " + new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n ?? 0);');

  // business/invitations/page.tsx
  content = content.replace(/const formatBudget = \(n\?: number\) => \(typeof n === "number" \? `\$\$\{n\.toLocaleString\(\)\}` : "—"\);/, 
    'const formatBudget = (n?: number) => (typeof n === "number" ? "Rs. " + new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n ?? 0) : "—");');

  // admin/campaigns/page.tsx
  content = content.replace(/· \$\{Number\(c\.budget\)\.toLocaleString\(\)\}/, 
    '· Rs. {new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(Number(c.budget) || 0)}');

  // promoter pages
  content = content.replace(/const fmtNpr = \(n\?: number \| null\) =>\s*new Intl\.NumberFormat\("en-NP", \{ style: "currency", currency: "NPR", maximumFractionDigits: 0 \}\)\.format\(n \?\? 0\);/, 
    'const fmtNpr = (n?: number | null) =>\n  "Rs. " + new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n ?? 0);');
    
  content = content.replace(/const fmtNpr = \(n: number\) =>\s*new Intl\.NumberFormat\("en-NP", \{ style: "currency", currency: "NPR", maximumFractionDigits: 0 \}\)\.format\(n \?\? 0\);/, 
    'const fmtNpr = (n: number) =>\n  "Rs. " + new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n ?? 0);');

  // components/campaigns/StatusBadge.tsx
  content = content.replace(/export function formatBudget\(n: number\) \{\s*if \(\!n\) return "\$0";\s*return `\$\$\{n\.toLocaleString\(\)\}`;\s*\}/, 
    'export function formatBudget(n?: number | null) {\n  return "Rs. " + new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n ?? 0);\n}');

  fs.writeFileSync(file, content);
});
console.log("Done");
