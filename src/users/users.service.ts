import { BalanceService } from './../balance/balance.service';
import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private balanceService: BalanceService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const user = await this.usersRepository.save(createUserDto);
    this.balanceService.initializeBalance(user);
    return user;
  }

  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  findByEmail(userEmail: string) {
    return this.usersRepository.findOne({ where: { email: userEmail } });
  }

  findOne(id: string): Promise<User> {
    return this.usersRepository.findOne(id);
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    avatar: Express.Multer.File,
  ) {
    return this.usersRepository.update(
      { id },
      { ...updateUserDto, avatar: avatar.buffer.toString('base64') },
    );
  }
  async remove(id: string) {
    return this.usersRepository.update({ id }, { isActive: false });
  }
}
