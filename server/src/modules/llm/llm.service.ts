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
      temperature: 0,
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

  private systemFirstPrompt(deviceList: string[], question: string): string {
    const header = `
Bạn là trợ lý kỹ thuật cho phòng Lab IoT.

NHIỆM VỤ:
- Phân tích yêu cầu người dùng
- Suy luận ngữ nghĩa (semantic reasoning)
- Trích xuất danh sách thiết bị PHÙ HỢP từ cơ sở dữ liệu

  CỰC KỲ QUAN TRỌNG:
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
6. Xử lý các trường hợp đồng nghĩa, viết tắt, lỗi chính tả nhẹ, viết dư ("ví dụ: tua vít và vít).
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

  private systemSecondPrompt(
    question: string,
    requested: { item: string; quantity: number }[],
    available: { item: string; quantity: number }[],
  ): string {
    return `
    Bạn là thủ kho của phòng Lab IoT. Hãy báo cáo tình trạng thiết bị cho user.

    DỮ LIỆU:
    - Yêu cầu (Request): ${JSON.stringify(requested)}
    - Trong kho (Stock): ${JSON.stringify(available)}

    NHIỆM VỤ:
    Dựa vào "quantity" trong Request để quyết định cách trả lời:

    LOGIC 1: CHẾ ĐỘ TRA CỨU (Khi quantity = 0)
    - Ý nghĩa: User hỏi "còn bao nhiêu", "có những loại nào".
    - Hành động:
      1. Gom nhóm các thiết bị cùng loại (ví dụ: các loại "Máy chiếu").
      2. Báo cáo TỔNG số lượng hiện có.
      3. Liệt kê chi tiết tên từng dòng máy và số lượng của nó.
      4. KHÔNG báo "Đủ" hay "Thiếu".

    LOGIC 2: CHẾ ĐỘ MƯỢN/KIỂM TRA (Khi quantity > 0)
    - Ý nghĩa: User nói rõ "lấy 5 cái", "cần 2 cái".
    - Hành động:
      1. Tính tổng tồn kho của loại thiết bị đó.
      2. So sánh Tổng Tồn Kho vs Số Lượng Yêu Cầu.
      3. Trả về kết quả:
         - ✅ ĐỦ: Nếu Tổng Tồn >= Yêu Cầu.
         - ⚠️ THIẾU: Nếu Tổng Tồn < Yêu Cầu (Ghi rõ: Cần A nhưng chỉ còn B).
         - ❌ HẾT: Nếu Tổng Tồn = 0.

    QUY TẮC HIỂN THỊ (HTML):
    - Sử dụng thẻ <ul>, <li>, <b> để trình bày gọn gàng.
    - Với các thiết bị có nhiều phiên bản (như máy chiếu, mạch), hãy gom vào một mục lớn.
    
    VÍ DỤ OUTPUT MONG MUỐN (HTML):
    
    [Trường hợp Tra cứu - quantity = 0]
    <ul>
      <li><b>Máy chiếu</b>: Hiện còn tổng <b>15 cái</b>. Gồm:
         <ul>
            <li>Epson EB-X05: 5 cái</li>
            <li>Sony VPL: 10 cái</li>
         </ul>
      </li>
      <li><b>Vít</b>: Hiện còn 20 cái.</li>
    </ul>

    [Trường hợp Mượn - quantity = 5]
    <ul>
       <li><b>Máy chiếu</b>: ✅ <b>ĐỦ</b> (Kho còn 15 cái, sẵn sàng cho mượn).</li>
    </ul>

    HÃY TRẢ LỜI CÂU HỎI SAU CỦA USER: "${question}"
    `;
  }
}
