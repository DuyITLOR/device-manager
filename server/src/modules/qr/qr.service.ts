import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import * as QRCode from 'qrcode';
// import { PassThrough } from 'stream';

@Injectable()
export class QrExportService {
  async generateQrPdf(ids: string[]): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });

      const buffers: Buffer[] = [];
      doc.on('data', (buffer) => buffers.push(buffer));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', (err: Error) => reject(err));

      const startX = 40;
      const startY = 40;
      const qrSize = 40;
      const gap = 20;
      const cols = 8;
      const textHeight = 30;
      const cellWidth = qrSize + gap;
      const cellHeight = qrSize + gap + textHeight;

      let currentX = startX;
      let currentY = startY;
      let count = 0;

      void (async () => {
        for (const id of ids) {
          const qrBuffer = await QRCode.toBuffer(id, {
            width: qrSize * 6,
            margin: 1,
          });

          if (currentY + cellHeight > doc.page.height - startY) {
            doc.addPage();
            currentY = startY;
            currentX = startX;
            count = 0;
          }

          doc.rect(currentX, currentY, cellWidth, cellHeight).stroke('#d1d5db');

          const qrPosX = currentX + (cellWidth - qrSize) / 2;
          const qrPosY = currentY + gap / 2;
          doc.image(qrBuffer, qrPosX, qrPosY, { width: qrSize });
          const shortId = id.slice(0, 3) + '...' + id.slice(-3);
          doc.fontSize(6).text(shortId, currentX, qrPosY + qrSize + 5, {
            width: cellWidth,
            align: 'center',
          });

          count++;
          if (count % cols === 0) {
            currentX = startX;
            currentY += cellHeight;
          } else {
            currentX += cellWidth;
          }
        }

        doc.end();
      })();
    });
  }
}
