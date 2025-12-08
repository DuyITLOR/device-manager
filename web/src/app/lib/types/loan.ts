export interface Loan {
  id: string;
  deviceId: string;
  borrowerId: string;
  status: 'BORROWED' | 'RETURNED';
  borrowedAt: string;
  returnedAt: string | null;
  note: string;
  borrower: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  device: {
    id: string;
    name: string;
    description: string;
    status: string;
  };
}

export interface LoansParams {
  search?: string;
  limit?: number;
  page?: number;
  status?: 'BORROWED' | 'RETURNED';
}

export interface LoansResponse {
  status: number;
  success: boolean;
  message: string;
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasMore: boolean;
  };
  data: Loan[];
}
