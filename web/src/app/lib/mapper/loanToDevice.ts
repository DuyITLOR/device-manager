import { Loan, LoansResponse } from '../types/loan';
import { Device } from '../types/device';

export const mapLoanToDevice = (loan: Loan): Device => {
  return {
    id: loan.device.id,
    name: loan.device.name,
    description: loan.device.description,
    status: loan.device.status as any,
  };
};

export const mapLoansToDevices = (loans: Loan[]): Device[] => {
  return loans.map((loan) => loan.device as Device);
};

export const mapLoansResponseToDevices = (loansResponse: LoansResponse) => {
  return {
    data: mapLoansToDevices(loansResponse.data),
    meta: loansResponse.meta,
  };
};
