import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { HttpException } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import { Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
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

    const firstPrompt = this.systemFirstPrompt(deviceList, sanitizedQuestion);

    const firstResponse = await this.callLLM(firstPrompt, {
      model: 'gemini-2.5-flash',
      responseMimeType: 'application/json',
      maxOutputTokens: 1000,
    });

    const dataResponse = await this.getAvailableDevicesCountByName(
      firstResponse.map((d) => d.item),
    );
    console.log('dataResponse:', JSON.stringify(dataResponse));
    const secondPrompt = this.systemSecondPrompt(
      question,
      firstResponse,
      dataResponse,
    );

    const secondResponse = await this.callLLM(secondPrompt, {
      model: 'gemini-2.5-flash',
      responseMimeType: 'text/html',
      maxOutputTokens: 1000,
    });

    return secondResponse;
  }

  private async callLLM(
    prompt: string,
    options?: {
      model?: string;
      responseMimeType?: string;
      maxOutputTokens?: number;
    },
  ): Promise<any> {
    if (!this.aiClient)
      throw new HttpException('AI client not initialized', 500);

    const model = options?.model || 'gemini-2.5-flash';

    try {
      const response = await this.aiClient.models.generateContent({
        model,
        contents: [{ parts: [{ text: prompt }] }],
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
      const jsonText = this.extractJson(rawText);
      const parsed = JSON.parse(jsonText);
      return this.validateResult(parsed);
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

  private systemFirstPrompt(deviceList: string[], question: string): string {
    const header = `
Bạn là trợ lý kỹ thuật cho phòng Lab IoT.

NHIỆM VỤ:
- Phân tích yêu cầu người dùng
- Suy luận ngữ nghĩa (semantic reasoning)
- Trích xuất danh sách thiết bị PHÙ HỢP từ cơ sở dữ liệu

⚠️ CỰC KỲ QUAN TRỌNG:
- KHÔNG giải thích
- KHÔNG markdown
- KHÔNG thêm chữ ngoài định dạng
- CHỈ trả nội dung nằm giữa START_JSON và END_JSON
`;

    const db = `
CƠ SỞ DỮ LIỆU THIẾT BỊ (DB):
${deviceList.map((d, i) => `${i + 1}. ${d}`).join('\n')}
`;

    const rules = `
QUY TẮC SUY LUẬN NGỮ NGHĨA:

1. Nếu người dùng dùng từ CHUNG (ví dụ: "máy", "thiết bị", "dụng cụ"):
   → Trả về TẤT CẢ thiết bị trong DB có liên quan về mặt ý nghĩa.

2. Nếu người dùng dùng từ CỤ THỂ (ví dụ: "máy chiếu"):
   → Trả về TẤT CẢ thiết bị liên quan đến khái niệm đó trong DB.

3. Nếu từ khóa KHÔNG trùng chính xác nhưng GẦN NGHĨA:
   → VẪN phải match (ví dụ: "đo pin" → "Máy đo pin").

4. Nếu người dùng KHÔNG nói số lượng:
   → quantity mặc định = 1.

5. Nếu KHÔNG tìm được thiết bị phù hợp:
   → Trả về mảng rỗng [].
`;

    const outputFormat = `
ĐỊNH DẠNG OUTPUT (BẮT BUỘC):

START_JSON
[
  {
    "item": "<tên thiết bị đúng trong DB>",
    "quantity": <số nguyên dương>
  }
]
END_JSON

Ví dụ HỢP LỆ:
START_JSON
[
  { "item": "Máy đo pin", "quantity": 5 }
]
END_JSON
`;

    const user = `
YÊU CẦU NGƯỜI DÙNG:
"${question}"
`;

    return [header, db, rules, outputFormat, user].join('\n\n');
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
        status: 'AVAILABLE',
        isDeleted: false,
      },
      _count: {
        _all: true,
      },
    });

    if (!devices || devices.length === 0) {
      throw new HttpException('No available devices found', 404);
    }

    return devices.map((d) => ({
      item: d.name,
      quantity: d._count._all,
    }));
  }

  private systemSecondPrompt(
    question: string,
    requested: { item: string; quantity: number }[],
    available: { item: string; quantity: number }[],
  ): string {
    return `
    Bạn là trợ lý kỹ thuật cho phòng Lab IoT.

    NHIỆM VỤ:
    - So sánh yêu cầu người dùng với số lượng thiết bị HIỆN CÓ trong kho
    - Trả lời NGẮN GỌN, RÕ RÀNG, DỄ HIỂU cho người dùng
    - KHÔNG bịa số
    - CHỈ dùng dữ liệu được cung cấp

    CÂU HỎI NGƯỜI DÙNG:
    "${question}"

    DANH SÁCH THIẾT BỊ NGƯỜI DÙNG YÊU CẦU:
    ${JSON.stringify(requested, null, 2)}

    SỐ LƯỢNG THIẾT BỊ HIỆN CÓ TRONG KHO:
    ${JSON.stringify(available, null, 2)}

    QUY TẮC TRẢ LỜI:
    1. Nếu số lượng hiện có >= số lượng yêu cầu → nói là ĐỦ
    2. Nếu thiếu → nói rõ THIẾU BAO NHIÊU
    3. Nếu không có thiết bị nào → nói là KHÔNG CÓ
    4. Câu trả lời dưới định dạng HTML giùm tui để FRONTEND dễ hiển thị
    5. KHÔNG JSON, KHÔNG markdown

    BẮT ĐẦU TRẢ LỜI:
    `;
  }
}
