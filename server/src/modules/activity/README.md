# Activity Logging Service

Hướng dẫn sử dụng Activity Logging Service để ghi lại các hoạt động trong hệ thống.

## Mục lục

- [Giới thiệu](#giới-thiệu)
- [Cài đặt](#cài-đặt)
- [Các loại Log Details](#các-loại-log-details)
- [Cách sử dụng](#cách-sử-dụng)
- [Ví dụ cụ thể](#ví-dụ-cụ-thể)
- [Utility Functions](#utility-functions)

## Giới thiệu

Activity Logging Service cho phép ghi lại các hoạt động của người dùng trong hệ thống như:

- Tạo, cập nhật, xóa thiết bị
- Tạo, xóa người dùng
- Mượn/trả thiết bị
- Chuyển giao thiết bị

## Cài đặt

### 1. Import ActivityService vào module của bạn

```typescript
import { ActivityModule } from '../modules/activity/activity.module';

@Module({
  imports: [ActivityModule],
  // ...
})
export class YourModule {}
```

### 2. Inject ActivityService vào service của bạn

```typescript
import { ActivityService } from '../modules/activity/activity.service';
import { ActivityAction, ActivityTargetType } from '@prisma/client';
import { CreateLogInput } from '../modules/activity/interfaces/logger.interface';

@Injectable()
export class YourService {
  constructor(private readonly activityService: ActivityService) {}

  // ...
}
```

## Các loại Log Details

Có 3 loại log details tùy theo mục đích sử dụng:

### 1. LogDiff - Dùng cho UPDATE

Ghi lại sự thay đổi giữa dữ liệu cũ và mới.

```typescript
{
  type: 'UPDATE',
  diff: {
    name: { old: 'Thiết bị cũ', new: 'Thiết bị mới' },
    status: { old: 'AVAILABLE', new: 'IN_USE' }
  },
}
```

### 2. LogIdentity - Dùng cho CREATE/DELETE

Ghi lại thông tin snapshot của đối tượng khi tạo hoặc xóa.

```typescript
{
  type: 'SNAPSHOT',
  name: 'Tên thiết bị'
}
```

### 3. LogFlow - Dùng cho LOAN/TRANSFER

Ghi lại thông tin luồng mượn/trả hoặc chuyển giao.

```typescript
{
  type: 'FLOW',
  deviceName: 'Laptop Dell',
  userName: 'Nguyễn Văn A',
}
```

## Cách sử dụng

### Method: `create(data: CreateLogInput)`

Ghi lại một activity log.

**Parameters:**

```typescript
interface CreateLogInput {
  actorId: string; // ID người thực hiện
  action: ActivityAction; // Hành động (xem danh sách bên dưới)
  targetType: ActivityTargetType; // Loại đối tượng: 'Device' | 'User' | 'Loan' | 'Transfer'
  targetId: string; // ID đối tượng bị tác động
  details: LogDetails; // Chi tiết log (LogDiff | LogIdentity | LogFlow)
}
```

**ActivityAction có sẵn:**

- `DEVICE_CREATE` - Tạo thiết bị
- `DEVICE_UPDATE` - Cập nhật thiết bị
- `DEVICE_DELETE` - Xóa thiết bị
- `USER_CREATE` - Tạo người dùng
- `USER_DELETE` - Xóa người dùng
- `LOAN_CREATE` - Tạo phiếu mượn
- `LOAN_RETURN` - Trả thiết bị
- `TRANSFER_REQUEST` - Yêu cầu chuyển giao
- `TRANSFER_APPROVE` - Duyệt chuyển giao
- `TRANSFER_REJECT` - Từ chối chuyển giao
- `TRANSFER_CANCEL` - Hủy chuyển giao

## Ví dụ cụ thể

### 1. Ghi log khi tạo thiết bị mới

```typescript
async createDevice(dto: CreateDeviceDto, userId: string) {
  const device = await this.prisma.device.create({
    data: {
      code: dto.code,
      name: dto.name,
      // ...
    },
  });

  // Ghi log
  await this.activityService.create({
    actorId: userId,
    action: ActivityAction.DEVICE_CREATE,
    targetType: ActivityTargetType.Device,
    targetId: device.id,
    details: {
      type: 'SNAPSHOT',
      code: device.code,
      name: device.name,
    },
  });

  return device;
}
```

### 2. Ghi log khi cập nhật thiết bị

```typescript
import { generateDiff } from '../../shared/utils';

async updateDevice(id: string, dto: UpdateDeviceDto, userId: string) {
  // Lấy dữ liệu cũ
  const oldDevice = await this.prisma.device.findUnique({
    where: { id },
  });

  // Cập nhật
  const updatedDevice = await this.prisma.device.update({
    where: { id },
    data: dto,
  });

  // So sánh và ghi log
  const diff = generateDiff(oldDevice, updatedDevice);
  if (diff) {
    await this.activityService.create({
      actorId: userId,
      action: ActivityAction.DEVICE_UPDATE,
      targetType: ActivityTargetType.Device,
      targetId: id,
      details: {
        type: 'UPDATE',
        diff,
      },
    });
  }

  return updatedDevice;
}
```

### 3. Ghi log khi xóa thiết bị

```typescript
async deleteDevice(id: string, userId: string) {
  // Lấy thông tin trước khi xóa
  const device = await this.prisma.device.findUnique({
    where: { id },
  });

  // Xóa
  await this.prisma.device.delete({
    where: { id },
  });

  // Ghi log
  await this.activityService.create({
    actorId: userId,
    action: ActivityAction.DEVICE_DELETE,
    targetType: ActivityTargetType.Device,
    targetId: id,
    details: {
      type: 'SNAPSHOT',
      name: device.name,
    },
  });
}
```

### 4. Ghi log khi tạo người dùng

```typescript
async createUser(dto: CreateUserDto, adminId: string) {
  const user = await this.prisma.user.create({
    data: {
      email: dto.email,
      name: dto.name,
      // ...
    },
  });

  await this.activityService.create({
    actorId: adminId,
    action: ActivityAction.USER_CREATE,
    targetType: ActivityTargetType.User,
    targetId: user.id,
    details: {
      type: 'SNAPSHOT',
      name: user.name,
    },
  });

  return user;
}
```

### 5. Ghi log khi mượn thiết bị

```typescript
async createLoan(dto: CreateLoanDto, userId: string) {
  const device = await this.prisma.device.findUnique({
    where: { id: dto.deviceId },
  });

  const borrower = await this.prisma.user.findUnique({
    where: { id: dto.borrowerId },
  });

  const loan = await this.prisma.loan.create({
    data: {
      deviceId: dto.deviceId,
      borrowerId: dto.borrowerId,
    },
  });

  await this.activityService.create({
    actorId: userId,
    action: ActivityAction.LOAN_CREATE,
    targetType: ActivityTargetType.Loan,
    targetId: loan.id,
    details: {
      type: 'FLOW',
      deviceName: device.name,
      userName: borrower.name,
    },
  });

  return loan;
}
```

### 6. Ghi log khi trả thiết bị

```typescript
async returnLoan(loanId: string, userId: string) {
  const loan = await this.prisma.loan.findUnique({
    where: { id: loanId },
    include: {
      device: true,
      borrower: true,
    },
  });

  await this.prisma.loan.update({
    where: { id: loanId },
    data: {
      returnDate: new Date(),
      status: 'RETURNED',
    },
  });

  await this.activityService.create({
    actorId: userId,
    action: ActivityAction.LOAN_RETURN,
    targetType: ActivityTargetType.Loan,
    targetId: loanId,
    details: {
      type: 'FLOW',
      deviceName: loan.device.name,
      userName: loan.borrower.name,
    },
  });
}
```

## Utility Functions

### `generateDiff(oldObj, newObj)`

So sánh 2 object và trả về những trường đã thay đổi.

**Location:** `src/shared/utils.ts`

**Parameters:**

- `oldObj`: Object chứa dữ liệu cũ
- `newObj`: Object chứa dữ liệu mới

**Returns:**

- `Record<string, { old: any; new: any }> | null` - Object chứa các thay đổi, hoặc `null` nếu không có thay đổi

**Lưu ý:**

- Tự động bỏ qua các trường `updatedAt` và `deletedAt`
- Chỉ so sánh các key có trong `newObj`

**Ví dụ:**

```typescript
import { generateDiff } from '../../shared/utils';

const oldDevice = {
  id: '1',
  name: 'Laptop cũ',
  status: 'AVAILABLE',
  updatedAt: new Date(),
};

const newDevice = {
  id: '1',
  name: 'Laptop mới',
  status: 'IN_USE',
  updatedAt: new Date(),
};

const diff = generateDiff(oldDevice, newDevice);
// Kết quả:
// {
//   name: { old: 'Laptop cũ', new: 'Laptop mới' },
//   status: { old: 'AVAILABLE', new: 'IN_USE' }
// }
```

## Lưu ý quan trọng

1. **Không throw error**: Method `create()` không throw error, nếu có lỗi sẽ được log ra console nhưng không làm crash chức năng chính.

2. **Actor ID bắt buộc**: Luôn cung cấp `actorId` để biết ai đã thực hiện hành động.

3. **Target ID**: `targetId` phải là ID của đối tượng bị tác động (device, user, loan, transfer).

4. **Details type**: Chọn đúng type của `details`:
   - `UPDATE` cho cập nhật
   - `SNAPSHOT` cho tạo/xóa
   - `FLOW` cho mượn/trả/chuyển giao

5. **Performance**: Activity logging chạy bất đồng bộ, không chặn luồng chính của request.

## Xem thêm

- [Activity Controller](./activity.controller.ts) - API endpoints để xem activity logs
- [Logger Interfaces](./interfaces/logger.interface.ts) - TypeScript interfaces
- [Shared Utils](../../shared/utils.ts) - Utility functions
