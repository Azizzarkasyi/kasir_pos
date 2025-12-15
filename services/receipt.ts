import { StoreInfo } from "@/services";
import { Transaction } from "@/types/api";

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
    } = params;

    const storeName = store?.owner_name || "Basofi Rswt";
    const storeBranch = store?.province?.name || "Pusat";
    const storeAddress = store?.address || "";
    const storePhone = store?.owner_phone || "";

    const items = transaction.items || [];
    const additionalFees =
        transaction.additional_fees?.length > 0
            ? transaction.additional_fees
            : [];

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
        await BluetoothEscposPrinter.printText("\n"+storeAddress + "\n\r", {});
    }
    if (storePhone) {
        await BluetoothEscposPrinter.printText(storePhone + "\n\r", {});
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

        await BluetoothEscposPrinter.printText(
            `${i + 1}. ${item.productName}\n\r`,
            {}
        );

        const lineTotal = item.quantity * item.price;

        const qtyLabel = `   ${formatCurrency(item.price)} x ${item.quantity}`;
        const lineText = formatKeyValue(qtyLabel, formatCurrency(lineTotal));

        await BluetoothEscposPrinter.printText(`${lineText}\n\r`, {});
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
            `Rp ${formatCurrency(subtotal)}`
        )}\n\r`,
        {}
    );
    await BluetoothEscposPrinter.printText(
        `${formatKeyValue(
            `Total (${items.length} Produk)` ,
            `Rp ${formatCurrency(subtotal)}`
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

    await BluetoothEscposPrinter.printText("\n\nPowered by ELBIC\n\r", {});
    await BluetoothEscposPrinter.printText("www.elbic.id\n\r\n\r", {});

    // Feed
    await BluetoothEscposPrinter.printText("\n\r\n\r", {});
}
