const fs = require('fs');
let code = fs.readFileSync('src/components/views/crm/Pages.tsx', 'utf-8');

// 1. Add useExchangeRates and eurToEgp to TargetsPage
const targetsPageRegex = /export function TargetsPage\(\) \{[\s\S]*?const store = /;
code = code.replace(targetsPageRegex, (match) => {
  return match.replace(
    'const store = ',
    'const { rates } = useExchangeRates();\n  const eurToEgp = rates?.EUR_EGP || 53.0;\n  const store = '
  );
});

// 2. Update StatCards in TargetsPage
const targetStatGridRegex = /<div className="crm-stat-grid crm-stat-grid-3">[\s\S]*?<\/div>/;
code = code.replace(targetStatGridRegex, (match) => {
  return match
    .replace(
      'helper="Sum of Target column"',
      'helper={`Sum of Target column · ${formatCurrencyEGP(targetTotal * eurToEgp, true)}`}'
    )
    .replace(
      'helper={`${Math.round(targetAttainment * 100)}% attainment · total Won deals`}',
      'helper={`${Math.round(targetAttainment * 100)}% attainment · ${formatCurrencyEGP(achievedTotal * eurToEgp, true)}`}'
    )
    .replace(
      'helper="Target total minus Won deals total"',
      'helper={`Target minus Won deals · ${formatCurrencyEGP((targetTotal - achievedTotal) * eurToEgp, true)}`}'
    );
});

// 3. Update Table Headers in TargetsPage
const targetTheadRegex = /<th>Target<\/th>\s*<th>Achieved<\/th>/;
code = code.replace(targetTheadRegex, '<th>Target (€)</th>\n              <th>Target (EGP)</th>\n              <th>Achieved (€)</th>\n              <th>Achieved (EGP)</th>');

// 4. Update Table Cells in TargetsPage
// We need to find the specific `<td>` for Target and Achieved.
// The Target cell currently ends with `formatCurrency(row.target, true)\n                    )}\n                  </td>`
// And we want to insert the EGP cell right after it.
const targetCellEndRegex = /formatCurrency\(row\.target, true\)\n\s*\)\}\n\s*<\/td>/;
code = code.replace(targetCellEndRegex, (match) => {
  return match + '\n                  <td>{formatCurrencyEGP(row.target * eurToEgp, true)}</td>';
});

const achievedCellEndRegex = /formatCurrency\(row\.achieved, true\)\n\s*\)\}\n\s*<\/td>/;
code = code.replace(achievedCellEndRegex, (match) => {
  return match + '\n                  <td>{formatCurrencyEGP(row.achieved * eurToEgp, true)}</td>';
});

// 5. Update ReportToolbar headers in TargetsPage
const reportToolbarRegex = /headers=\{\[\s*"Target ID",\s*"Product Line",\s*"Target",\s*"Achieved",\s*"Progress",\s*"Status",\s*\]\}/;
code = code.replace(reportToolbarRegex, 'headers={[\n                "Target ID",\n                "Product Line",\n                "Target (€)",\n                "Target (EGP)",\n                "Achieved (€)",\n                "Achieved (EGP)",\n                "Progress",\n                "Status",\n              ]}');

// 6. Update exportRows in TargetsPage
// We need to add the EGP values to the exported rows.
const exportRowsRegex = /const exportRows = rows\.map\(\(row\) => \{\s*return \[\s*row\.id,\s*productLine,\s*row\.target,\s*row\.achieved,\s*`\$\{row\.target \? Math\.round\(\(row\.achieved \/ row\.target\) \* 100\) : 0\}%`,\s*row\.status,\s*\];\s*\}\);/;
code = code.replace(exportRowsRegex, `const exportRows = rows.map((row) => {
    const productLine = row.productLine ?? row.focus ?? "To be assigned";
    return [
      row.id,
      productLine,
      row.target,
      row.target * eurToEgp,
      row.achieved,
      row.achieved * eurToEgp,
      \`\${row.target ? Math.round((row.achieved / row.target) * 100) : 0}%\`,
      row.status,
    ];
  });`);

fs.writeFileSync('src/components/views/crm/Pages.tsx', code);
console.log('TargetsPage updated with EGP');
