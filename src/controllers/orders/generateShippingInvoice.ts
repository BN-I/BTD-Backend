import { Request, Response } from "express";
import { isValidObjectId } from "mongoose";
import axios from "axios";
import sharp from "sharp";
import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import order from "../../models/order";
import StoreInformation from "../../models/storeInformation";
import BusinessInformation from "../../models/businessInformation";

const BRAND_COLOR = "#00BFA6";
const TEXT_MUTED = "#6b7280";
const PAGE_LEFT = 50;
const PAGE_RIGHT = 545;
const PAGE_WIDTH = PAGE_RIGHT - PAGE_LEFT;

const formatDate = (date: Date | string) => {
  const d = new Date(date);
  const yy = String(d.getFullYear()).slice(-2);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
};

// Copied into build/assets by scripts/copy-email-templates.js at build time.
const BTD_LOGO_PATH = path.join(__dirname, "..", "..", "assets", "btd-logo.png");
const btdLogoBuffer = fs.existsSync(BTD_LOGO_PATH)
  ? fs.readFileSync(BTD_LOGO_PATH)
  : null;

// pdfkit only embeds PNG/JPEG, so any fetched image (webp, avif, etc.) is
// normalized to PNG via sharp before being handed to doc.image().
const fetchImageBuffer = async (
  url?: string,
  maxSize = 200
): Promise<Buffer | null> => {
  if (!url) return null;
  try {
    const response = await axios.get(url, {
      responseType: "arraybuffer",
      timeout: 5000,
    });
    return await sharp(Buffer.from(response.data))
      .resize({ width: maxSize, height: maxSize, fit: "inside" })
      .png()
      .toBuffer();
  } catch {
    return null;
  }
};

const generateShippingInvoice = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: "Order ID is not valid" });
  }

  const orderDoc: any = await order.findById(id);

  if (!orderDoc) {
    return res.status(404).json({ message: "Order not found" });
  }

  const vendorId = orderDoc.vendor?._id;
  const [storeInformation, businessInformation] = await Promise.all([
    vendorId ? StoreInformation.findOne({ vendorID: vendorId }) : null,
    vendorId ? BusinessInformation.findOne({ vendorID: vendorId }) : null,
  ]);

  const storeName =
    storeInformation?.storeName || orderDoc.vendor?.name || "Store";
  const storeTagline = storeInformation?.storeDescription || "";

  const fromAddressLines = businessInformation?.businessAddress
    ? [
        businessInformation.businessAddress,
        [businessInformation.city, businessInformation.state, businessInformation.postalCode]
          .filter(Boolean)
          .join(", "),
      ]
    : [
        orderDoc.vendor?.streetAddress,
        [orderDoc.vendor?.city, orderDoc.vendor?.state, orderDoc.vendor?.postalCode]
          .filter(Boolean)
          .join(", "),
      ].filter(Boolean);

  const gifts = orderDoc.gifts || [];

  const [logoBuffer, ...productImageBuffers] = await Promise.all([
    fetchImageBuffer(storeInformation?.storeImage),
    ...gifts.map((gift: any) => fetchImageBuffer(gift.product?.images?.[0])),
  ]);

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="invoice-${orderDoc._id}.pdf"`
  );

  const doc = new PDFDocument({ size: "A4", margin: 50 });
  doc.pipe(res);

  // ---------- Header ----------
  const btdLogoSize = 70;
  const btdLogoTop = 40;
  if (btdLogoBuffer) {
    try {
      doc.image(btdLogoBuffer, PAGE_LEFT, btdLogoTop, {
        fit: [btdLogoSize, btdLogoSize],
      });
    } catch {
      // ignore malformed image
    }
  }

  // Right-hand column is built as a single sequential cursor (rightY) so
  // that a wrapped line (e.g. a long order id) simply pushes the next line
  // down instead of overlapping it.
  const rightColX = PAGE_LEFT + 300;
  const rightColWidth = PAGE_RIGHT - rightColX;
  let rightY = 50;
  const rightLine = (text: string, bold = true, color = "#000000") => {
    doc
      .font(bold ? "Helvetica-Bold" : "Helvetica")
      .fontSize(9)
      .fillColor(color)
      .text(text, rightColX, rightY, { width: rightColWidth, align: "right" });
    rightY = doc.y + 2;
  };

  rightLine(`Invoice Date: ${formatDate(new Date())}`);
  rightLine(`Order No.: ${orderDoc._id}`);
  rightLine(`Order Date: ${formatDate(orderDoc.createdAt)}`);

  // ---------- Store branding ----------
  const brandingTop = btdLogoTop + btdLogoSize + 25;
  if (logoBuffer) {
    try {
      doc.image(logoBuffer, PAGE_LEFT, brandingTop, { fit: [40, 40] });
    } catch {
      // ignore malformed image
    }
  } else {
    doc
      .roundedRect(PAGE_LEFT, brandingTop, 40, 40, 6)
      .fill(BRAND_COLOR);
    doc
      .fillColor("#ffffff")
      .font("Helvetica-Bold")
      .fontSize(18)
      .text(storeName.charAt(0).toUpperCase(), PAGE_LEFT, brandingTop + 10, {
        width: 40,
        align: "center",
      });
  }

  doc
    .fillColor("#000000")
    .font("Helvetica-Bold")
    .fontSize(13)
    .text(storeName, PAGE_LEFT + 50, brandingTop + 4, { width: 260 });
  if (storeTagline) {
    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor(TEXT_MUTED)
      .text(storeTagline, PAGE_LEFT + 50, doc.y + 2, { width: 260 });
  }
  // doc.y is a single shared cursor: capture the left column's bottom here,
  // before the right-column calls below overwrite it with their own position.
  const brandingBottomY = Math.max(doc.y, brandingTop + 40);

  rightY += 10;
  rightLine("From Address:", true);
  fromAddressLines.forEach((line: string) => rightLine(line, false));

  // ---------- Billing / Shipping ----------
  const addressTop = Math.max(brandingBottomY + 20, rightY + 20);
  const columnWidth = PAGE_WIDTH / 2 - 10;

  doc
    .font("Helvetica-Bold")
    .fontSize(11)
    .fillColor("#000000")
    .text("Billing Address:", PAGE_LEFT, addressTop);
  doc
    .font("Helvetica-Bold")
    .fontSize(11)
    .text("Shipping Address:", PAGE_LEFT + columnWidth + 20, addressTop);

  const formatCityStateZip = (city?: string, state?: string, zip?: string) =>
    [[city, state].filter(Boolean).join(", "), zip].filter(Boolean).join(" ");

  const billingLines = [
    orderDoc.user?.name,
    orderDoc.billingAddress || orderDoc.address,
    formatCityStateZip(
      orderDoc.billingCity || orderDoc.city,
      orderDoc.billingState || orderDoc.state,
      orderDoc.billingZipcode || orderDoc.zipcode
    ),
    orderDoc.user?.email,
    orderDoc.user?.phoneNumber,
  ].filter(Boolean);

  const shippingLines = [
    orderDoc.recipientName || orderDoc.user?.name,
    orderDoc.address,
    formatCityStateZip(orderDoc.city, orderDoc.state, orderDoc.zipcode),
    orderDoc.additionalAddressInfo,
  ].filter(Boolean);

  doc.font("Helvetica").fontSize(9.5).fillColor("#000000");
  let billingY = doc.y + 4;
  billingLines.forEach((line) => {
    doc.text(line, PAGE_LEFT, billingY, { width: columnWidth });
    billingY = doc.y + 2;
  });

  let shippingY = addressTop + 16;
  shippingLines.forEach((line) => {
    doc.text(line, PAGE_LEFT + columnWidth + 20, shippingY, {
      width: columnWidth,
    });
    shippingY = doc.y + 2;
  });

  doc.y = Math.max(billingY, shippingY) + 20;

  // ---------- Items table ----------
  // Column widths sum to PAGE_WIDTH (495) so the last column's right edge
  // lands exactly on PAGE_RIGHT instead of overflowing the page margin.
  const columns = {
    sno: { x: PAGE_LEFT, width: 25 },
    image: { x: PAGE_LEFT + 25, width: 45 },
    product: { x: PAGE_LEFT + 70, width: 200 },
    qty: { x: PAGE_LEFT + 270, width: 45 },
    price: { x: PAGE_LEFT + 315, width: 80 },
    total: { x: PAGE_LEFT + 395, width: 100 },
  };

  const tableTop = doc.y;
  doc.font("Helvetica-Bold").fontSize(9.5).fillColor("#000000");
  doc.text("S.No", columns.sno.x, tableTop, { width: columns.sno.width });
  doc.text("Image", columns.image.x, tableTop, { width: columns.image.width });
  doc.text("Product", columns.product.x, tableTop, { width: columns.product.width });
  doc.text("Qty", columns.qty.x, tableTop, { width: columns.qty.width });
  doc.text("Price", columns.price.x, tableTop, {
    width: columns.price.width,
    align: "right",
  });
  doc.text("Total price", columns.total.x, tableTop, {
    width: columns.total.width,
    align: "right",
  });

  doc
    .moveTo(PAGE_LEFT, tableTop + 16)
    .lineTo(PAGE_RIGHT, tableTop + 16)
    .strokeColor("#000000")
    .stroke();

  let rowY = tableTop + 24;
  const rowImageSize = 36;

  gifts.forEach((gift: any, index: number) => {
    const rowTop = rowY;
    const imageBuffer = productImageBuffers[index];

    if (imageBuffer) {
      try {
        doc.image(imageBuffer, columns.image.x, rowTop, {
          fit: [rowImageSize, rowImageSize],
        });
      } catch {
        // ignore malformed image
      }
    }

    const variationParts = [
      gift.selectedVariations?.size,
      gift.selectedVariations?.color,
    ].filter(Boolean);
    const title = gift.product?.title || "Item";
    const price = gift.price || 0;

    doc
      .font("Helvetica")
      .fontSize(9.5)
      .fillColor("#000000")
      .text(String(index + 1), columns.sno.x, rowTop + 12, {
        width: columns.sno.width,
      });

    doc
      .font("Helvetica")
      .fontSize(9.5)
      .fillColor("#000000")
      .text(title, columns.product.x, rowTop, { width: columns.product.width });
    if (variationParts.length) {
      doc
        .font("Helvetica")
        .fontSize(8)
        .fillColor(TEXT_MUTED)
        .text(variationParts.join(" / "), columns.product.x, doc.y + 1, {
          width: columns.product.width,
        });
    }

    doc
      .font("Helvetica")
      .fontSize(9.5)
      .fillColor("#000000")
      .text("1", columns.qty.x, rowTop + 12, { width: columns.qty.width });
    doc.text(`$${price.toFixed(2)}`, columns.price.x, rowTop + 12, {
      width: columns.price.width,
      align: "right",
    });
    doc.text(`$${price.toFixed(2)}`, columns.total.x, rowTop + 12, {
      width: columns.total.width,
      align: "right",
    });

    const rowBottom = Math.max(doc.y, rowTop + rowImageSize);
    rowY = rowBottom + 10;
  });

  doc.moveTo(PAGE_LEFT, rowY).lineTo(PAGE_RIGHT, rowY).strokeColor("#000000").stroke();

  // ---------- Totals ----------
  let totalsY = rowY + 12;
  const totalsLabelX = columns.price.x - 30;
  const totalsLabelWidth = columns.total.x - totalsLabelX;

  const totalsLine = (label: string, value: string, bold = false) => {
    doc
      .font(bold ? "Helvetica-Bold" : "Helvetica")
      .fontSize(bold ? 11 : 9.5)
      .fillColor("#000000")
      .text(label, totalsLabelX, totalsY, {
        width: totalsLabelWidth,
        align: "left",
      });
    doc.text(value, columns.total.x, totalsY, {
      width: columns.total.width,
      align: "right",
    });
    totalsY = doc.y + 6;
  };

  totalsLine("Subtotal", `$${(orderDoc.subtotal || 0).toFixed(2)}`);
  totalsLine(
    "Shipping",
    orderDoc.shippingAmount
      ? `$${orderDoc.shippingAmount.toFixed(2)}`
      : "Free shipping"
  );
  if (orderDoc.taxAmount) {
    totalsLine("Tax", `$${orderDoc.taxAmount.toFixed(2)}`);
  }

  doc
    .fillOpacity(0.08)
    .fillColor(BRAND_COLOR)
    .rect(totalsLabelX - 10, totalsY - 4, PAGE_RIGHT - (totalsLabelX - 10), 24)
    .fill()
    .fillOpacity(1);

  totalsLine("Total", `$${(orderDoc.totalAmount || 0).toFixed(2)}`, true);

  // ---------- Footer ----------
  doc.moveDown(2);
  doc.font("Helvetica-Bold").fontSize(9.5).fillColor("#000000");
  doc.text(`Payment Status: ${orderDoc.status}`, PAGE_LEFT, doc.y);

  if (orderDoc.trackingID || orderDoc.trackingURL) {
    doc.font("Helvetica").fontSize(9.5);
    if (orderDoc.trackingID) {
      doc.text(`Tracking ID: ${orderDoc.trackingID}`, PAGE_LEFT, doc.y + 4);
    }
    if (orderDoc.trackingURL) {
      doc.text(`Tracking URL: ${orderDoc.trackingURL}`, PAGE_LEFT);
    }
  }

  // ---------- Disclaimer ----------
  const disclaimerY = 770;
  doc
    .moveTo(PAGE_LEFT, disclaimerY)
    .lineTo(PAGE_RIGHT, disclaimerY)
    .strokeColor("#e5e7eb")
    .stroke();
  doc
    .font("Helvetica-Oblique")
    .fontSize(8)
    .fillColor(TEXT_MUTED)
    .text(
      "This is an electronically generated invoice and does not require a signature.",
      PAGE_LEFT,
      disclaimerY + 8,
      { width: PAGE_WIDTH, align: "center" }
    );

  doc.end();
};

export { generateShippingInvoice };
