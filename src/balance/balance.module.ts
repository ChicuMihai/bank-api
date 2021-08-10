import { Balance } from './entities/balance.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BalanceService } from './balance.service';
import { Module } from '@nestjs/common';
@Module({
  imports: [TypeOrmModule.forFeature([Balance])],
  exports: [BalanceService],
  providers: [BalanceService],
})
export class BalanceModule {}
