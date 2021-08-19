import { BalanceService } from './../balance/balance.service';
import { Status } from './types';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { Repository } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cron, SchedulerRegistry, CronExpression } from '@nestjs/schedule';
import * as stringify from 'csv-stringify';
import * as zlib from 'zlib';
@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    private balanceService: BalanceService,
    private schedulerRegistry: SchedulerRegistry,
  ) {}
  private readonly logger = new Logger(TransactionService.name);

  createTransacition(transactionData: CreateTransactionDto) {
    this.transactionRepository.save({
      ...transactionData,
      status: Status.CREATED,
    });
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async verifyTransaction() {
    this.logger.log('STARTED TRANSACTION CRONJOB');
    const transactions = await this.transactionRepository.find({
      where: { status: Status.CREATED },
    });
    for (const transaction of transactions) {
      this.transactionRepository.update(
        { id: transaction.id },
        {
          status: Status.IN_REVIEW,
        },
      );
      const timeout = setTimeout(
        () => this.onInReviewHandler(transaction),
        60000,
      );
      this.schedulerRegistry.addTimeout('transactionInReview', timeout);
    }
  }

  async onInReviewHandler(transaction: Transaction) {
    const { amount, senderUserId } = transaction;
    const isTransactionAmountValid =
      await this.balanceService.verifyBalanceForTransaction(
        amount,
        senderUserId,
      );

    this.logger.log(
      `TRANSACTION WITH ID ${transaction.id} IS VALID:${isTransactionAmountValid}`,
    );

    const newTransactionStatus = isTransactionAmountValid
      ? Status.COMPLETE
      : Status.DECLINED;

    this.logger.log(
      `UPDATED TRANSACTION ${transaction.id} WITH STATUS ${newTransactionStatus}`,
    );

    this.transactionRepository.update(
      { id: transaction.id },
      {
        status: newTransactionStatus,
      },
    );
    newTransactionStatus === Status.COMPLETE &&
      this.balanceService.transferTransactionBalance(transaction);
  }

  async checkTransactionStatus(transactionId: string) {
    const { id, status } = await this.transactionRepository.findOne(
      transactionId,
    );
    if (!id) {
      throw new Error('Transaction not found');
    }
    return { transactionStatus: status };
  }

  findAllTransactions(userId: string) {
    return this.transactionRepository.find({
      where: { senderUserId: userId },
      order: { updated_at: 'ASC' },
    });
  }

  async exportCSV(userId: string) {
    const transactionData = await this.findAllTransactions(userId);
    const transactions = transactionData.map((transc, indx) => ({
      id: indx,
      amount: transc.amount,
      sender: transc.senderUserId,
      recipient: transc.recipientUserId,
      description: transc.description,
      status: transc.status,
    }));

    return stringify(transactions, { header: true }).pipe(zlib.createGzip());
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
