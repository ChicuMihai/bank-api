import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsNotEmpty } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @IsNotEmpty()
  dateOfBirth?: Date;
}
