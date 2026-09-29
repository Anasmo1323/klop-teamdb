const fs = require('fs');
let code = fs.readFileSync('src/components/views/crm/Pages.tsx', 'utf-8');

const forecastIdx = code.indexOf('export function ForecastPage() {');
const poIdx = code.indexOf('export function PurchaseOrdersPage() {');
const invoiceIdx = code.indexOf('export function InvoicesPage() {');

let forecastSection = code.substring(forecastIdx, poIdx);
let poSection = code.substring(poIdx, invoiceIdx);

const deleteButtonHTML = `                  <td>
                    <AdminDeleteButton
                      onDelete={() => store.deleteRow(originalIndex)}
                    />
                  </td>`;

const forecastReplacement = `                  <td>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                        title="Translate to PO"
                        onClick={() => handleConvertToPO(row)}
                      >
                        <ShoppingCart size={14} />
                      </Button>
                      <AdminDeleteButton
                        onDelete={() => store.deleteRow(originalIndex)}
                      />
                    </div>
                  </td>`;

const poReplacement = `                  <td>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                        title="Translate to Invoice"
                        onClick={() => handleConvertToInvoice(row)}
                      >
                        <ReceiptText size={14} />
                      </Button>
                      <AdminDeleteButton
                        onDelete={() => store.deleteRow(originalIndex)}
                      />
                    </div>
                  </td>`;

forecastSection = forecastSection.replace(deleteButtonHTML, forecastReplacement);
poSection = poSection.replace(deleteButtonHTML, poReplacement);

code = code.substring(0, forecastIdx) + forecastSection + poSection + code.substring(invoiceIdx);

fs.writeFileSync('src/components/views/crm/Pages.tsx', code);
console.log('Buttons replaced.');
