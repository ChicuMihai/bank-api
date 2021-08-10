import { BalanceModule } from './../balance/balance.module';
import { TransactionService } from './transaction.service';
import { Transaction } from './entities/transaction.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Module } from '@nestjs/common';
@Module({
  imports: [TypeOrmModule.forFeature([Transaction]), BalanceModule],
  exports: [TransactionService],
  providers: [TransactionService],
})
export class TransactionModule {}
