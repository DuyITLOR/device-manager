export type TransferCreateResponse = {
  id: string;
  status: string;
  requestedAt: string;
  loanId: string;
  device: {
    id: string;
    name: string;
  };
  userHasDevice: {
    id: string;
    name: string;
    email: string;
  };
  userRequestDevice: {
    id: string;
    name: string;
    email: string;
  };
};

export type TransferRequestDetail = TransferCreateResponse;
