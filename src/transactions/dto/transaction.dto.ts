import { Status } from './../types';
import { Exclude, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

@Exclude()
export class TransactionDto {
  @Expose()
  @ApiProperty()
  status: Status;

  @Expose()
  @ApiProperty()
  senderUserId: string;

  @Expose()
  @ApiProperty()
  recipientUserId: string;

  @Expose()
  @ApiProperty()
  amount: number;

  @Expose()
  @ApiProperty()
  description: string;

  @Expose()
  @ApiProperty()
  currencyCode: string;

  @Expose()
  @ApiProperty()
  updated_at: Date;
}
