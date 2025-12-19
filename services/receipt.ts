import { StoreInfo, StruckConfig } from "@/services";
import { Transaction } from "@/types/api";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
// Lazy import BluetoothEscposPrinter to avoid crash when native module is not linked
let BluetoothEscposPrinter: any = null;
try {
    BluetoothEscposPrinter = require("@vardrz/react-native-bluetooth-escpos-printer").BluetoothEscposPrinter;
} catch (e) {
    console.warn("[receipt] BluetoothEscposPrinter not available:", e);
}

const LINE_WIDTH = 32;

function formatKeyValue(label: string, value: string) {
    const cleanLabel = label.trimEnd();
    const totalLength = cleanLabel.length + value.length;

    if (totalLength >= LINE_WIDTH) {
        return `${cleanLabel} ${value}`;
    }

    const spaces = LINE_WIDTH - totalLength;
    return `${cleanLabel}${" ".repeat(spaces)}${value}`;
}

export async function printReceipt(params: {
    transaction: Transaction;
    store: StoreInfo | null;
    subtotal: number;
    dibayar: number;
    kembalian: number;
    transactionDate: string;
    paymentMethod: string;
    formatCurrency: (value: number) => string;
    struckConfig?: StruckConfig | null;
}) {
    if (!BluetoothEscposPrinter) {
        throw new Error("Printer module tidak tersedia. Pastikan native module sudah ter-link.");
    }
    const {
        transaction,
        store,
        subtotal,
        dibayar,
        kembalian,
        transactionDate,
        paymentMethod,
        formatCurrency,
        struckConfig,
    } = params;

    const storeName = store?.owner_name || "Basofi Rswt";
    const storeBranch = store?.province?.name || "Pusat";
    const storeAddress = store?.address || "";
    const storePhone = store?.owner_phone || "";
    
    // Use struck config or fallback to defaults
    const headerDescription = struckConfig?.header_description || "";
    const footerDescription = struckConfig?.footer_description || "Powered by ELBIC";
    const displayTransactionNote = struckConfig?.display_transaction_note ?? false;
    const displayRunningNumbers = struckConfig?.display_running_number ?? false;
    const displayUnitNextToQty = struckConfig?.display_unit_next_to_qty ?? false;
    const hideTaxPercentage = struckConfig?.hide_tax_percentage ?? false;

    console.log("hideTaxPercentage", hideTaxPercentage);
    console.log("displayTransactionNote", displayTransactionNote);
    console.log("displayRunningNumbers", displayRunningNumbers);
    console.log("displayUnitNextToQty", displayUnitNextToQty);
    console.log("transaction", transaction);

    const items = transaction.items || [];
    const additionalFees =
        transaction.additional_fees?.length > 0
            ? transaction.additional_fees
            : [];
    const transactionSubtotal = (transaction as any)?.sub_total || 0;
    const total = (transaction as any)?.total || transactionSubtotal;

    const separator = "-".repeat(LINE_WIDTH) + "\n\r";

    await BluetoothEscposPrinter.printerAlign(
        BluetoothEscposPrinter.ALIGN.CENTER
    );

    // --- STORE HEADER ---
    await BluetoothEscposPrinter.printText(
        `${storeName}${storeBranch ? " - " + storeBranch : ""}\n\r`,
        { widthtimes: 1, heigthtimes: 1 }
    );

    if (storeAddress) {
        await BluetoothEscposPrinter.printText("\n" + storeAddress + "\n\r", {});
    }
    if (storePhone) {
        await BluetoothEscposPrinter.printText(storePhone + "\n\r", {});
    }
    if (headerDescription) {
        await BluetoothEscposPrinter.printText("\n" + headerDescription + "\n\r", {});
    }

    // --- INFO STRUK ---
    await BluetoothEscposPrinter.printText(separator, {});
    await BluetoothEscposPrinter.printerAlign(
        BluetoothEscposPrinter.ALIGN.LEFT
    );

    await BluetoothEscposPrinter.printText(
        `${formatKeyValue("No. Struk", transaction.invoiceNumber || "-")}\n\r`,
        {}
    );
    await BluetoothEscposPrinter.printText(
        `${formatKeyValue("Waktu", transactionDate)}\n\r`,
        {}
    );
    await BluetoothEscposPrinter.printText(
        `${formatKeyValue("Pembayaran", paymentMethod)}\n\r`,
        {}
    );
    await BluetoothEscposPrinter.printText(separator, {});

    // --- COPY NOTICE ---
    await BluetoothEscposPrinter.printerAlign(
        BluetoothEscposPrinter.ALIGN.CENTER
    );
    await BluetoothEscposPrinter.printText("### SALINAN ###\n\r", {});
    await BluetoothEscposPrinter.printText(separator, {});

    await BluetoothEscposPrinter.printerAlign(
        BluetoothEscposPrinter.ALIGN.LEFT
    );

    // --- ITEMS ---
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const itemNumber = displayRunningNumbers ? `${i + 1}. ` : "";

        await BluetoothEscposPrinter.printText(
            `${itemNumber}${item.productName}\n\r`,
            {}
        );

        const qtyLabel = `   ${formatCurrency(item.price)} x ${item.quantity}`;
        if (displayUnitNextToQty && (item as any).unit) {
            // Add unit next to quantity if enabled
            const lineTotal = item.quantity * item.price;
            const qtyWithUnit = `${item.quantity} ${(item as any).unit}`;
            const qtyLabel = `   ${formatCurrency(item.price)} x ${qtyWithUnit}`;
            const lineText = formatKeyValue(qtyLabel, formatCurrency(lineTotal));
            await BluetoothEscposPrinter.printText(`${lineText}\n\r`, {});
        } else {
            const lineTotal = item.quantity * item.price;
            const lineText = formatKeyValue(qtyLabel, formatCurrency(lineTotal));
            await BluetoothEscposPrinter.printText(`${lineText}\n\r`, {});
        }
    }

    // --- Additional Fees ---
    if (additionalFees.length > 0) {
        await BluetoothEscposPrinter.printText(separator, {});
        await BluetoothEscposPrinter.printerAlign(
            BluetoothEscposPrinter.ALIGN.CENTER
        );
        await BluetoothEscposPrinter.printText("BIAYA TAMBAHAN\n\r", {});
        await BluetoothEscposPrinter.printText(separator, {});
        await BluetoothEscposPrinter.printerAlign(
            BluetoothEscposPrinter.ALIGN.LEFT
        );

        additionalFees.forEach((fee, i) => {
            BluetoothEscposPrinter.printText(
                `${i + 1}. ${fee.name}: Rp ${formatCurrency(fee.amount || 0)}\n\r`,
                {}
            );
        });
    }

    // --- TOTAL SUMMARY ---
    await BluetoothEscposPrinter.printText(separator, {});

    await BluetoothEscposPrinter.printText(
        `${formatKeyValue(
            "Subtotal",
            `Rp ${formatCurrency(transactionSubtotal)}`
        )}\n\r`,
        {}
    );

    // --- TAX INFO (if not hidden) ---
    if (!hideTaxPercentage && transaction.tax) {
        await BluetoothEscposPrinter.printText(
            `${formatKeyValue(
                "Pajak",
                `Rp ${formatCurrency(transaction.tax)}`
            )}\n\r`,
            {}
        );
    }

    await BluetoothEscposPrinter.printText(
        `${formatKeyValue(
            `Total (${items.length + " Produk"})`,
            `Rp ${formatCurrency(total)}`
        )}\n\r`,
        {}
    );
    await BluetoothEscposPrinter.printText(
        `${formatKeyValue("Bayar", `Rp ${formatCurrency(dibayar)}`)}\n\r`,
        {}
    );
    await BluetoothEscposPrinter.printText(
        `${formatKeyValue("Kembali", `Rp ${formatCurrency(kembalian)}`)}\n\r`,
        {}
    );

    // --- FOOTER ---
    await BluetoothEscposPrinter.printerAlign(
        BluetoothEscposPrinter.ALIGN.CENTER
    );

    if (displayTransactionNote && transaction.notes) {
        await BluetoothEscposPrinter.printText("\n" + transaction.notes + "\n\r", {});
    }

    await BluetoothEscposPrinter.printText("\n\n" + footerDescription + "\n\r", {});
    await BluetoothEscposPrinter.printText("Powered by ELBIC\n\r", {});
    await BluetoothEscposPrinter.printText("www.elbic.id\n\r\n\r", {});

    // Feed
    await BluetoothEscposPrinter.printText("\n\r\n\r", {});
}

interface AdditionalFee {
    name: string;
    amount: number;
}

interface ReceiptItem {
    productName?: string;
    quantity: number;
    price: number;
    subtotal: number;
}

interface ReceiptPDFParams {
    transaction: Transaction | null;
    store: StoreInfo | null;
    items: ReceiptItem[];
    subtotal: number;
    total: number;
    dibayar: number;
    kembalian: number;
    transactionDate: string;
    paymentMethod: string;
    additionalFees?: AdditionalFee[];
    formatCurrency: (value: number) => string;
    struckConfig?: StruckConfig | null;
}

export function generateReceiptHTML(params: ReceiptPDFParams): string {
    const {
        transaction,
        store,
        items,
        subtotal,
        total,
        dibayar,
        kembalian,
        transactionDate,
        paymentMethod,
        additionalFees = [],
        formatCurrency,
        struckConfig,
    } = params;

    const storeName = store?.owner_name || "Basofi Rswt";
    const storeBranch = store?.province?.name || "Pusat";
    const storeAddress = store?.address || "";
    const storePhone = store?.owner_phone || "";
    const headerDescription = struckConfig?.header_description || "";
    const footerDescription = struckConfig?.footer_description || "Powered by ELBIC";
    const displayTransactionNote = struckConfig?.display_transaction_note ?? false;
    const displayRunningNumbers = struckConfig?.display_running_number ?? false;
    const displayUnitNextToQty = struckConfig?.display_unit_next_to_qty ?? false;
    const hideTaxPercentage = struckConfig?.hide_tax_percentage ?? false;

    const totalProduk = items.reduce((sum, item) => sum + item.quantity, 0);

    const itemsHTML = items
        .map((item, index) => {
            const unitPrice = item.price || (item.subtotal ? item.subtotal / item.quantity : 0);
            const lineTotal = item.subtotal || item.price * item.quantity;
            const itemNumber = displayRunningNumbers ? `${index + 1}. ` : "";
            const qtyWithUnit = (displayUnitNextToQty && (item as any).unit) 
                ? `${item.quantity} ${(item as any).unit}` 
                : `${item.quantity}`;
            return `
                <div class="item-row">
                    <div class="item-left">
                        <div class="item-name">${itemNumber}${item.productName || "Item"}</div>
                        <div class="item-sub">${formatCurrency(unitPrice)} x ${qtyWithUnit}</div>
                    </div>
                    <div class="item-amount">${formatCurrency(lineTotal)}</div>
                </div>
            `;
        })
        .join("");

    const additionalFeesHTML =
        additionalFees.length > 0
            ? additionalFees
                .map(
                    (fee) => `
                        <div class="item-row">
                            <div class="item-left">
                                <div class="item-name">${fee.name}</div>
                            </div>
                            <div class="item-amount">${formatCurrency(fee.amount || 0)}</div>
                        </div>
                    `
                )
                .join("")
            : "";

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Struk Pembayaran</title>
            <style>
                @page {
                    size: A4;
                    margin: 0;
                }
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                html, body {
                    width: 100%;
                    height: 100%;
                    margin: 0;
                    padding: 0;
                }
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    background-color: #ffffff;
                    padding: 40px;
                }
                .receipt {
                    width: 100%;
                    background-color: #ffffff;
                    padding: 40px 0;
                }
                .store-header {
                    text-align: center;
                    margin-bottom: 24px;
                }
                .store-name {
                    font-size: 42px;
                    font-weight: 600;
                    color: #1a1a1a;
                    margin-bottom: 8px;
                }
                .store-info {
                    font-size: 28px;
                    color: #666;
                    margin-top: 8px;
                }
                .divider {
                    height: 2px;
                    background-color: #e0e0e0;
                    margin: 24px 0;
                }
                .info-grid {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }
                .info-row {
                    display: flex;
                    justify-content: space-between;
                }
                .info-label {
                    font-size: 28px;
                    color: #666;
                }
                .info-value {
                    font-size: 28px;
                    color: #1a1a1a;
                    font-weight: 500;
                }
                .copy-banner {
                    text-align: center;
                    font-size: 28px;
                    font-weight: 600;
                    color: #1a1a1a;
                    margin: 24px 0;
                }
                .items-section {
                    margin-top: 16px;
                }
                .item-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 20px;
                }
                .item-left {
                    flex-shrink: 1;
                    padding-right: 16px;
                }
                .item-name {
                    font-size: 28px;
                    color: #1a1a1a;
                    margin-bottom: 6px;
                }
                .item-sub {
                    font-size: 24px;
                    color: #666;
                }
                .item-amount {
                    font-size: 28px;
                    color: #1a1a1a;
                    font-weight: 500;
                }
                .summary-section {
                    margin-top: 20px;
                }
                .summary-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 12px;
                }
                .summary-label {
                    font-size: 28px;
                    color: #666;
                }
                .summary-value {
                    font-size: 28px;
                    color: #1a1a1a;
                }
                .summary-label-strong {
                    font-weight: 600;
                    color: #1a1a1a;
                }
                .summary-value-strong {
                    font-weight: 600;
                }
                .footer {
                    text-align: center;
                    margin-top: 36px;
                }
                .footer-text {
                    font-size: 22px;
                    color: #666;
                    margin-bottom: 4px;
                }
            </style>
        </head>
        <body>
            <div class="receipt">
                <div class="store-header">
                    <div class="store-name">${storeName} (${storeBranch})</div>
                    ${storeAddress ? `<div class="store-info">${storeAddress}</div>` : ""}
                    ${storePhone ? `<div class="store-info">${storePhone}</div>` : ""}
                    ${headerDescription ? `<div class="store-info">${headerDescription}</div>` : ""}
                </div>

                <div class="divider"></div>

                <div class="info-grid">
                    ${transaction?.cashier?.name ? `
                    <div class="info-row">
                        <span class="info-label">Kasir</span>
                        <span class="info-value">${transaction.cashier.name}</span>
                    </div>
                    ` : ""}
                    <div class="info-row">
                        <span class="info-label">Waktu</span>
                        <span class="info-value">${transactionDate}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">No. Struk</span>
                        <span class="info-value">#${transaction?.invoiceNumber || "-"}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Jenis Pembayaran</span>
                        <span class="info-value">${paymentMethod}</span>
                    </div>
                </div>

                <div class="divider"></div>

                <div class="copy-banner">### SALINAN ###</div>

                <div class="divider"></div>

                <div class="items-section">
                    ${itemsHTML}
                </div>

                ${additionalFeesHTML ? `
                    <div style="margin-top: 12px;">
                        ${additionalFeesHTML}
                    </div>
                ` : ""}

                <div class="divider"></div>

                <div class="summary-section">
                    <div class="summary-row">
                        <span class="summary-label">Subtotal</span>
                        <span class="summary-value">${formatCurrency(subtotal)}</span>
                    </div>
                    ${!hideTaxPercentage && transaction?.tax ? `
                        <div class="summary-row">
                            <span class="summary-label">Pajak</span>
                            <span class="summary-value">${formatCurrency(transaction.tax)}</span>
                        </div>
                    ` : ""}
                    <div class="summary-row">
                        <span class="summary-label summary-label-strong">Total (${totalProduk} Produk)</span>
                        <span class="summary-value summary-value-strong">${formatCurrency(total)}</span>
                    </div>
                    <div class="summary-row">
                        <span class="summary-label">Bayar</span>
                        <span class="summary-value">${formatCurrency(dibayar)}</span>
                    </div>
                    <div class="summary-row">
                        <span class="summary-label">Kembali</span>
                        <span class="summary-value">${formatCurrency(kembalian)}</span>
                    </div>
                </div>

                ${displayTransactionNote && transaction?.notes ? `
                    <div style="margin-top: 20px; padding: 16px; background-color: #f5f5f5; border-radius: 8px;">
                        <div style="font-size: 24px; color: #666; margin-bottom: 8px;">Catatan:</div>
                        <div style="font-size: 26px; color: #1a1a1a;">${transaction.notes}</div>
                    </div>
                ` : ""}

                <div class="footer">
                    <div class="footer-text">${footerDescription}</div>
                    <div class="footer-text">Powered by ELBIC</div>
                    <div class="footer-text">www.elbic.id</div>
                </div>
            </div>
        </body>
        </html>
    `;
}

export async function shareReceiptAsPDF(params: ReceiptPDFParams): Promise<void> {
    const html = generateReceiptHTML(params);

    const { uri } = await Print.printToFileAsync({
        html,
        width: 600,
    });

    // Rename file to use transaction ID
    const fileName = params.transaction?.id
        ? `struk_${params.transaction.id}.pdf`
        : `struk_${Date.now()}.pdf`;

    const newUri = uri.replace(/[^/]+$/, fileName);

    // Move/rename the file
    const FileSystem = require('expo-file-system/legacy');
    await FileSystem.moveAsync({
        from: uri,
        to: newUri,
    });

    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
        throw new Error("Sharing tidak tersedia di perangkat ini");
    }

    await Sharing.shareAsync(newUri, {
        mimeType: "application/pdf",
        dialogTitle: "Bagikan Struk",
        UTI: "com.adobe.pdf",
    });
}
