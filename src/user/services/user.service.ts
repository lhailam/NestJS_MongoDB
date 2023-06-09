import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import { CreateUserDto, LoginUserDto } from '../dto/user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async createUser(userDto: CreateUserDto) {
    userDto.password = await bcrypt.hash(userDto.password, 10);

    // check exists
    const userInDb = await this.userRepository.findOneBy({
      email: userDto.email,
    });
    if (userInDb) {
      // throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
      throw new BadRequestException(`Email ${userDto.email} already exists`)

    }

    return await this.userRepository.create(userDto);
  }

  async findByLogin({ email, password }: LoginUserDto) {
    const user = await this.userRepository.findOneBy({
      email: email,
    });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.UNAUTHORIZED);
    }

    const is_equal = bcrypt.compareSync(password, user.password);

    if (!is_equal) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }

    return user;
  }

  async findByEmail(email) {
    return await this.userRepository.findOneBy({
      email: email,
    });
  }
}
