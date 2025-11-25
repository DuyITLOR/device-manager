import { Module } from '@nestjs/common';
import { QrController } from './qr.controller';
import { QrExportService } from './qr.service';

@Module({
  controllers: [QrController],
  providers: [QrExportService],
  exports: [QrExportService],
})
export class QrModule {}
