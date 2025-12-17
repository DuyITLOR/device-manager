import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { HttpException } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import { Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { systemFirstPrompt, systemSecondPrompt } from './prompt';
@Injectable()
export class LlmService implements OnModuleInit {
  private aiClient: any = null;
  private readonly logger = new Logger(LlmService.name);
  private prisma = new PrismaClient();
  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    const apiKey = this.config.get<string>('apikey.key');
    if (!apiKey) {
      throw new Error('[LLM] Missing API key configuration!');
    } else {
      this.aiClient = new GoogleGenAI({ apiKey });
    }
  }

  async processUserQuestion(question: string): Promise<string> {
    const sanitizedQuestion = this.sanitizeUserInput(question);

    const deviceList = this.loadDeviceDatabase();

    const firstPrompt = systemFirstPrompt(deviceList, sanitizedQuestion);

    const firstResponse = await this.callLLM(firstPrompt, {
      model: 'gemini-2.5-flash',
      temperature: 0,
      maxOutputTokens: 1000,
    });

    const dataResponse = await this.getAvailableDevicesCountByName(
      firstResponse.map((d) => d.item),
    );
    console.log('dataResponse:', JSON.stringify(dataResponse));
    const secondPrompt = systemSecondPrompt(
      question,
      firstResponse,
      dataResponse,
    );

    const secondResponse = await this.callLLM(
      secondPrompt,
      {
        model: 'gemini-2.5-flash',
        temperature: 0.3,
        maxOutputTokens: 500,
      },
      true,
    );

    return secondResponse;
  }

  private async callLLM(
    prompt: string,
    options?: {
      model?: string;
      temperature?: number;
      maxOutputTokens?: number;
    },
    flag = false,
  ): Promise<any> {
    if (!this.aiClient)
      throw new HttpException('AI client not initialized', 500);

    const model = options?.model || 'gemini-2.5-flash';

    try {
      const response = await this.aiClient.models.generateContent({
        model,
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: options?.temperature || 0,
          maxOutputTokens: options?.maxOutputTokens || 500,
        },
      });

      if (!response) throw new HttpException('No response from LLM', 500);
      console.log(
        'LLM raw response:',
        response?.candidates?.[0]?.content?.parts?.[0]?.text,
      );
      const rawText = response?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!rawText) {
        throw new Error('Empty LLM output');
      }
      if (!flag) {
        const jsonText = this.extractJson(rawText);
        const parsed = JSON.parse(jsonText);
        return this.validateResult(parsed);
      } else {
        return rawText;
      }
    } catch (err) {
      this.logger.error('callLLM error', err);
      throw new HttpException('Error calling Gemini', 500);
    }
  }

  private sanitizeUserInput(raw: string, maxLen = 2000): string {
    if (!raw) return '';
    let s = raw.trim();

    // giới hạn độ dài
    if (s.length > maxLen) s = s.slice(0, maxLen) + '...';

    // loại control characters (non-printable)
    s = s.replace(/[\u0000-\u001F\u007F]/g, ' ');

    // escape placeholder token nếu user cố tình chèn
    s = s.replace(/__USER_REQUEST__/g, '[USER_REQUEST]');

    // heuristic: loại câu kiểu "ignore previous instructions" (tiếng Anh & tiếng Việt)
    s = s.replace(/ignore previous instructions/gi, '');
    s = s.replace(/bỏ qua.*(hướng dẫn|lệnh)/gi, '');

    return s;
  }

  private loadDeviceDatabase(): string[] {
    const filePath = path.join(process.cwd(), 'src', 'data', 'devices.txt');

    console.log('file path:', filePath);

    if (!fs.existsSync(filePath)) {
      throw new HttpException('Device.txt not found the path', 500);
    }

    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean);
      return lines;
    } catch (err) {
      console.error('Error reading devices.txt:', err);
      throw new HttpException('Error reading devices.txt', 500);
    }
  }

  private extractJson(text: string): string {
    if (!text) {
      throw new Error('Empty LLM response');
    }

    // bỏ ```json ``` nếu có
    const cleaned = text
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();

    // tìm object hoặc array JSON đầu tiên
    const match = cleaned.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);

    if (!match) {
      throw new Error('No JSON found in LLM response');
    }

    return match[1];
  }

  private validateResult(data: any) {
    if (!Array.isArray(data)) {
      throw new HttpException('LLM response must be an array', 404);
    }

    for (const item of data) {
      if (typeof item !== 'object') {
        throw new HttpException('Each item must be object', 404);
      }

      if (typeof item.item !== 'string') {
        throw new HttpException('item must be string', 404);
      }

      if (typeof item.quantity !== 'number') {
        throw new HttpException('quantity must be number', 404);
      }
    }

    return data;
  }
  private async getAvailableDevicesCountByName(listName: string[]) {
    const devices = await this.prisma.device.groupBy({
      by: ['name'],
      where: {
        name: {
          in: listName,
          mode: 'insensitive',
        },
        isDeleted: false,
      },
      _count: {
        _all: true,
      },
    });

    if (!devices || devices.length === 0) {
      return [];
    }

    return devices.map((d) => ({
      item: d.name,
      quantity: d._count._all,
    }));
  }
}
