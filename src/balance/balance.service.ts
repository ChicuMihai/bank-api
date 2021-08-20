import { Transaction } from './../transactions/entities/transaction.entity';
import { Balance } from './entities/balance.entity';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class BalanceService {
  constructor(
    @InjectRepository(Balance) private balanceRepository: Repository<Balance>,
  ) {}
  private readonly logger = new Logger(BalanceService.name);

  async verifyBalanceForTransaction(amount: number, userId: string) {
    const { amount: balanceAmount } = await this.balanceRepository.findOne({
      where: { user: userId },
    });
    return amount > balanceAmount ? false : true;
  }

  async initializeBalance(user: User) {
    this.logger.log(`INIT BALANCE FOR USER ${user.id}`);
    return this.balanceRepository.save({ amount: 100.5, user: user });
  }

  updateBalanceAmount(changedBalance: Balance, amount) {
    this.balanceRepository.update(changedBalance, {
      amount,
    });
  }

  getBalanceAmount(userId: string) {
    return this.balanceRepository.findOne({
      where: { user: userId },
    });
  }

  async transferTransactionBalance(transaction: Transaction) {
    const {
      amount: transactionAmount,
      recipientUserId,
      senderUserId,
    } = transaction;
    const senderBalance = await this.balanceRepository.findOne({
      where: { user: senderUserId },
    });

    const reciverBalance = await this.balanceRepository.findOne({
      where: { user: recipientUserId },
    });
    if (!senderBalance && !reciverBalance) {
      throw new Error('Balance transfer could not happen');
    }
    this.logger.log(
      `TRANSFER BALANCE ${transactionAmount} FROM ${senderBalance.user.id} TO ${reciverBalance.user.id}`,
    );
    this.updateBalanceAmount(
      senderBalance,
      senderBalance.amount - transactionAmount,
    );

    this.updateBalanceAmount(
      reciverBalance,
      reciverBalance.amount + transactionAmount,
    );
  }
}
