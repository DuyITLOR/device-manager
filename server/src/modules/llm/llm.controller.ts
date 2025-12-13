// src/modules/llm/llm.controller.tsimport { Controller, Post, Body } from '@nestjs/common';
import { Controller, Post, Body } from '@nestjs/common';
import { LlmService } from './llm.service';

@Controller('llm')
export class LlmController {
  constructor(private readonly llmService: LlmService) {}

  @Post('analyze')
  async analyze(@Body() body: { question?: string }) {
    const q = (body?.question ?? '').toString();
    return await this.llmService.processUserQuestion(q);
  }
}
