import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class BalanceDto {
  @Expose()
  @ApiProperty()
  amount: string;
}
