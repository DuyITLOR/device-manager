export const ACTIVITY_ACTION_MAPPER = {
  LOAN_CREATE: 'Mượn thiết bị',
  LOAN_RETURN: 'Trả thiết bị',
  LOAN_UPDATE: 'Cập nhật phiếu mượn',
  TRANSFER_REQUEST: 'Yêu cầu chuyển quyền',
  TRANSFER_APPROVE: 'Chấp nhận chuyển quyền',
  TRANSFER_REJECT: 'Từ chối chuyển quyền',
  TRANSFER_CANCEL: 'Hủy chuyển quyền',
  DEVICE_CREATE: 'Thêm thiết bị mới',
  DEVICE_UPDATE: 'Cập nhật thiết bị',
  DEVICE_DELETE: 'Xóa thiết bị',
  USER_CREATE: 'Tạo người dùng',
  USER_DELETE: 'Xóa người dùng',
};

export const ACTIVITY_TARGET_TYPE_MAPPER = {
  Device: 'Thiết bị',
  Loan: 'Mượn/Trả',
  Transfer: 'Chuyển quyền',
  User: 'Người dùng',
};

export const TARGET_TYPE_COLOR_MAPPER: Record<string, string> = {
  Loan: 'bg-primary',
  Transfer: 'bg-secondary',
  Device: 'bg-accent',
  User: 'bg-purple-500',
};
