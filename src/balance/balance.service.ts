import { CreateTransactionDto } from './../transactions/dto/create-transaction.dto';
import { Balance } from './entities/balance.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class BalanceService {
  constructor(
    @InjectRepository(Balance) private balanceRepository: Repository<Balance>,
  ) {}

  async verifyBalanceForTransaction(amount: number, userId: string) {
    const { amount: balanceAmount } = await this.balanceRepository.findOne({
      where: { user: userId },
    });
    if (amount > balanceAmount) return false;
    return true;
  }

  async initializeBalance(user: User) {
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

  async transferTransactionBalance(transaction: CreateTransactionDto) {
    const {
      amount: transactionAmount,
      recipientUserId,
      senderUserId,
    } = transaction;
    const senderBalance = await this.balanceRepository.findOne({
      where: senderUserId,
    });

    const reciverBalance = await this.balanceRepository.findOne({
      where: recipientUserId,
    });
    if (!senderBalance && !reciverBalance) {
      throw new Error('Balance transfer could not happen');
    }
    this.updateBalanceAmount(
      senderBalance,
      senderBalance.amount - transactionAmount,
    );

    this.updateBalanceAmount(
      senderBalance,
      senderBalance.amount + transactionAmount,
    );
  }
}
