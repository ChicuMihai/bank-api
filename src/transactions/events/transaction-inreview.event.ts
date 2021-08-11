export class TrasactionInReviewEvent {
  constructor(transactionAmount: number, userId: string) {
    this.amount = transactionAmount;
    this.senderUserId = userId;
  }

  amount: number;
  senderUserId: string;
}
