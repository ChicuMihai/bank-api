import { BalanceService } from './../balance/balance.service';
import { Status } from './types';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { Repository } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    private balanceService: BalanceService,
  ) {}

  createTransacition(transactionData: CreateTransactionDto) {
    const { amount, senderUserId } = transactionData;
    this.balanceService
      .verifyBalanceForTransaction(amount, senderUserId)
      .then(() => {
        this.transactionRepository.save({
          ...transactionData,
          status: Status.CREATED,
        });
      })
      .catch(() => new Error('Transaction was not successful'));
  }

  async checkTransactionStatus(transactionId: string) {
    const { id, status } = await this.transactionRepository.findOne(
      transactionId,
    );
    if (!id) {
      throw new Error('Transaction not found');
    }
    return status;
  }

  findAllTransactions(userId: string) {
    return this.transactionRepository.find({
      where: { senderUserId: userId },
      order: { created_at: 'ASC' },
    });
  }

  getTransactionDetails(transactionId: string) {
    return this.transactionRepository.findOne(transactionId);
  }

  async cancelTransaction(transactionId: string) {
    const { status, ...rest } = await this.transactionRepository.findOne(
      transactionId,
    );
    if (status === Status.COMPLETE || status === Status.CANCELED) {
      throw new Error('Cannot cancel transaction');
    } else
      this.transactionRepository.save({
        ...rest,
        status: Status.CANCELED,
      });
  }
}
