import { IsNotEmpty } from 'class-validator';

export class CreateTransactionDto {
  @IsNotEmpty()
  senderUserId: string;

  @IsNotEmpty()
  recipientUserId: string;

  @IsNotEmpty()
  amount: number;

  description: string;
}
