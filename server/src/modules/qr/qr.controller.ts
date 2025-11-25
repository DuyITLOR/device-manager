import { Body, Controller, Post, Res } from '@nestjs/common';
import { QrExportService } from './qr.service';
import { ExportQrDto } from './dto/export-qr.dto';
import { Roles } from '../../common/decorators';
import { ROLES } from '../../shared/constants';
import type { Response } from 'express';

@Controller('qr')
export class QrController {
  constructor(private readonly qrExportService: QrExportService) {}

  @Roles(ROLES.ADMIN, ROLES.MANAGER)
  @Post('export')
  async exportQrCodes(@Body() dto: ExportQrDto, @Res() res: Response) {
    const buffer = await this.qrExportService.generateQrPdf(dto.ids);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="qr-codes.pdf"');
    res.setHeader('Content-Length', buffer.length.toString());
    res.send(buffer);
  }
}
