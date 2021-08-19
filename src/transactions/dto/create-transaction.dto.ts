import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateTransactionDto {
  @IsNotEmpty()
  @ApiProperty()
  senderUserId: string;

  @IsNotEmpty()
  @ApiProperty()
  recipientUserId: string;

  @IsNotEmpty()
  @ApiProperty()
  amount: number;

  @IsNotEmpty()
  @ApiProperty()
  description: string;
}
